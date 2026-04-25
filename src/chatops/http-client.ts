// ---------------------------------------------------------------------------
// ChatOpsHttpClient — Axios-based HTTP client with Bearer token auth
// ---------------------------------------------------------------------------
import axios, { type AxiosInstance } from "axios";
import FormData from "form-data";
import type {
  ChatOpsRawTeam,
  ChatOpsRawChannel,
  ChatOpsRawPost,
  ChatOpsRawPostList,
  ChatOpsRawFileUploadResponse,
} from "../types/chatops-api.js";
import type {
  ChatOpsTeam,
  ChatOpsChannel,
  ChatOpsPost,
  ChatOpsPostList,
  ChatOpsFileUploadResult,
} from "../types.js";
import { authError, chatopsHttpError } from "../errors.js";
import {
  teamsUrl,
  teamUrl,
  searchTeamsUrl,
  teamChannelsUrl,
  searchChannelsUrl,
  channelUrl,
  channelByNameUrl,
  channelPostsUrl,
  postThreadUrl,
  pinnedPostsUrl,
  postsUrl,
  filesUrl,
} from "./endpoints.js";
import {
  mapTeam,
  mapChannel,
  mapPost,
  mapPostList,
  mapFileUploadResult,
} from "./mappers.js";

export class ChatOpsHttpClient {
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.http = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Don't throw on non-2xx — we inspect status manually
      validateStatus: () => true,
    });
  }

  // ── Teams ──────────────────────────────────────────────────────────────────

  async getTeams(page = 0, perPage = 60): Promise<ChatOpsTeam[]> {
    const endpoint = `${teamsUrl(this.baseUrl)}?page=${page}&per_page=${perPage}`;
    const res = await this.http.get<ChatOpsRawTeam[]>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return (res.data as ChatOpsRawTeam[]).map(mapTeam);
  }

  async searchTeams(term: string): Promise<ChatOpsTeam[]> {
    const endpoint = searchTeamsUrl(this.baseUrl);
    const res = await this.http.post<ChatOpsRawTeam[]>(endpoint, { term });
    this.assertOk(res.status, endpoint, res.data);
    return (res.data as ChatOpsRawTeam[]).map(mapTeam);
  }

  async getTeam(teamId: string): Promise<ChatOpsTeam> {
    const endpoint = teamUrl(this.baseUrl, teamId);
    const res = await this.http.get<ChatOpsRawTeam>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapTeam(res.data as ChatOpsRawTeam);
  }

  // ── Channels ───────────────────────────────────────────────────────────────

  async getTeamChannels(
    teamId: string,
    page = 0,
    perPage = 60
  ): Promise<ChatOpsChannel[]> {
    const endpoint = `${teamChannelsUrl(this.baseUrl, teamId)}?page=${page}&per_page=${perPage}`;
    const res = await this.http.get<ChatOpsRawChannel[]>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return (res.data as ChatOpsRawChannel[]).map(mapChannel);
  }

  async searchChannels(teamId: string, term: string): Promise<ChatOpsChannel[]> {
    const endpoint = searchChannelsUrl(this.baseUrl, teamId);
    const res = await this.http.post<ChatOpsRawChannel[]>(endpoint, { term });
    this.assertOk(res.status, endpoint, res.data);
    return (res.data as ChatOpsRawChannel[]).map(mapChannel);
  }

  async getChannel(channelId: string): Promise<ChatOpsChannel> {
    const endpoint = channelUrl(this.baseUrl, channelId);
    const res = await this.http.get<ChatOpsRawChannel>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapChannel(res.data as ChatOpsRawChannel);
  }

  async getChannelByName(teamId: string, channelName: string): Promise<ChatOpsChannel> {
    const endpoint = channelByNameUrl(this.baseUrl, teamId, channelName);
    const res = await this.http.get<ChatOpsRawChannel>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapChannel(res.data as ChatOpsRawChannel);
  }

  // ── Posts ──────────────────────────────────────────────────────────────────

  async getChannelPosts(
    channelId: string,
    page = 0,
    perPage = 30
  ): Promise<ChatOpsPostList> {
    const endpoint = `${channelPostsUrl(this.baseUrl, channelId)}?page=${page}&per_page=${perPage}`;
    const res = await this.http.get<ChatOpsRawPostList>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapPostList(res.data as ChatOpsRawPostList);
  }

  async getPostThread(postId: string): Promise<ChatOpsPostList> {
    const endpoint = postThreadUrl(this.baseUrl, postId);
    const res = await this.http.get<ChatOpsRawPostList>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapPostList(res.data as ChatOpsRawPostList);
  }

  async getPinnedPosts(channelId: string): Promise<ChatOpsPostList> {
    const endpoint = pinnedPostsUrl(this.baseUrl, channelId);
    const res = await this.http.get<ChatOpsRawPostList>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapPostList(res.data as ChatOpsRawPostList);
  }

  async createPost(
    channelId: string,
    message: string,
    rootId?: string,
    fileIds?: string[]
  ): Promise<ChatOpsPost> {
    const endpoint = postsUrl(this.baseUrl);
    const body: Record<string, unknown> = { channel_id: channelId, message };
    if (rootId) body.root_id = rootId;
    if (fileIds?.length) body.file_ids = fileIds;

    const res = await this.http.post<ChatOpsRawPost>(endpoint, body);
    this.assertOk(res.status, endpoint, res.data);
    return mapPost(res.data as ChatOpsRawPost);
  }

  // ── Files ──────────────────────────────────────────────────────────────────

  async uploadFile(
    channelId: string,
    fileBuffer: Buffer,
    filename: string
  ): Promise<ChatOpsFileUploadResult> {
    const endpoint = filesUrl(this.baseUrl);
    const form = new FormData();
    form.append("channel_id", channelId);
    form.append("files", fileBuffer, { filename });

    const res = await this.http.post<ChatOpsRawFileUploadResponse>(endpoint, form, {
      headers: form.getHeaders(),
    });
    this.assertOk(res.status, endpoint, res.data);

    const raw = res.data as ChatOpsRawFileUploadResponse;
    if (!raw.file_infos?.length) {
      throw chatopsHttpError(res.status, endpoint, "No file_infos in upload response");
    }
    return mapFileUploadResult(raw.file_infos[0]);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private checkAuthFailure(status: number): void {
    if (status === 401 || status === 403) {
      throw authError();
    }
  }

  private assertOk(status: number, url: string, body: unknown): void {
    this.checkAuthFailure(status);
    if (status < 200 || status >= 300) {
      const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
      throw chatopsHttpError(status, url, bodyStr);
    }
  }
}
