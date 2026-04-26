// ---------------------------------------------------------------------------
// ChatOpsHttpClient — Axios-based HTTP client with SSO session cookie auth
// ---------------------------------------------------------------------------
import axios, { type AxiosInstance } from "axios";
import FormData from "form-data";
import type {
  ChatOpsRawTeam, ChatOpsRawChannel, ChatOpsRawPost, ChatOpsRawPostList,
  ChatOpsRawFileUploadResponse, ChatOpsRawReaction, ChatOpsRawEmoji,
} from "../types/chatops-api.js";
import type {
  ChatOpsTeam, ChatOpsChannel, ChatOpsPost, ChatOpsPostList,
  ChatOpsFileUploadResult, ChatOpsReaction, ChatOpsEmoji, SessionCookies,
} from "../types.js";
import { sessionExpired, chatopsHttpError } from "../errors.js";
import {
  teamsUrl, teamUrl, searchTeamsUrl, teamChannelsUrl, searchChannelsUrl,
  channelUrl, channelByNameUrl, channelPostsUrl, postThreadUrl, pinnedPostsUrl,
  postsUrl, filesUrl, postReactionsUrl, reactionsUrl, currentUserUrl,
  emojiListUrl, emojiUrl, emojiByNameUrl,
} from "./endpoints.js";
import {
  mapTeam, mapChannel, mapPost, mapPostList, mapFileUploadResult, mapReaction, mapEmoji,
} from "./mappers.js";

export class ChatOpsHttpClient {
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;

  constructor(baseUrl: string, cookies: SessionCookies) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.http = axios.create({
      headers: { Cookie: cookies.cookieHeader, Accept: "application/json", "Content-Type": "application/json" },
      maxRedirects: 0,
      validateStatus: () => true,
    });
  }

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

  async getTeamChannels(teamId: string, page = 0, perPage = 60): Promise<ChatOpsChannel[]> {
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

  async getChannelPosts(channelId: string, page = 0, perPage = 30): Promise<ChatOpsPostList> {
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

  async createPost(channelId: string, message: string, rootId?: string, fileIds?: string[]): Promise<ChatOpsPost> {
    const endpoint = postsUrl(this.baseUrl);
    const body: Record<string, unknown> = { channel_id: channelId, message };
    if (rootId) body.root_id = rootId;
    if (fileIds?.length) body.file_ids = fileIds;
    const res = await this.http.post<ChatOpsRawPost>(endpoint, body);
    this.assertOk(res.status, endpoint, res.data);
    return mapPost(res.data as ChatOpsRawPost);
  }

  async uploadFile(channelId: string, fileBuffer: Buffer, filename: string): Promise<ChatOpsFileUploadResult> {
    const endpoint = filesUrl(this.baseUrl);
    const form = new FormData();
    form.append("channel_id", channelId);
    form.append("files", fileBuffer, { filename });
    const res = await this.http.post<ChatOpsRawFileUploadResponse>(endpoint, form, { headers: form.getHeaders() });
    this.assertOk(res.status, endpoint, res.data);
    const raw = res.data as ChatOpsRawFileUploadResponse;
    if (!raw.file_infos?.length) throw chatopsHttpError(res.status, endpoint, "No file_infos in upload response");
    return mapFileUploadResult(raw.file_infos[0]);
  }

  async getCurrentUserId(): Promise<string> {
    const endpoint = currentUserUrl(this.baseUrl);
    const res = await this.http.get<{ id: string }>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return (res.data as { id: string }).id;
  }

  async getPostReactions(postId: string): Promise<ChatOpsReaction[]> {
    const endpoint = postReactionsUrl(this.baseUrl, postId);
    const res = await this.http.get<ChatOpsRawReaction[]>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return (res.data as ChatOpsRawReaction[]).map(mapReaction);
  }

  async addReaction(userId: string, postId: string, emojiName: string): Promise<ChatOpsReaction> {
    const endpoint = reactionsUrl(this.baseUrl);
    const res = await this.http.post<ChatOpsRawReaction>(endpoint, { user_id: userId, post_id: postId, emoji_name: emojiName });
    this.assertOk(res.status, endpoint, res.data);
    return mapReaction(res.data as ChatOpsRawReaction);
  }

  async getEmoji(emojiId: string): Promise<ChatOpsEmoji> {
    const endpoint = emojiUrl(this.baseUrl, emojiId);
    const res = await this.http.get<ChatOpsRawEmoji>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapEmoji(res.data as ChatOpsRawEmoji);
  }

  async getEmojiByName(emojiName: string): Promise<ChatOpsEmoji> {
    const endpoint = emojiByNameUrl(this.baseUrl, emojiName);
    const res = await this.http.get<ChatOpsRawEmoji>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return mapEmoji(res.data as ChatOpsRawEmoji);
  }

  async listEmoji(page = 0, perPage = 200): Promise<ChatOpsEmoji[]> {
    const endpoint = `${emojiListUrl(this.baseUrl)}?page=${page}&per_page=${perPage}&sort=name`;
    const res = await this.http.get<ChatOpsRawEmoji[]>(endpoint);
    this.assertOk(res.status, endpoint, res.data);
    return (res.data as ChatOpsRawEmoji[]).map(mapEmoji);
  }

  private checkAuthFailure(status: number, body: unknown): void {
    if (status === 401 || status === 403) throw sessionExpired();
    if (status >= 300 && status < 400) {
      throw sessionExpired(`ChatOps redirected (${status}) — session likely expired. Run \`chatops-auth-login\` to reauthenticate.`);
    }
    if (typeof body === "string" && isLoginPage(body)) {
      throw sessionExpired("ChatOps returned a login page — session has expired. Run `chatops-auth-login` to reauthenticate.");
    }
  }

  private assertOk(status: number, url: string, body: unknown): void {
    this.checkAuthFailure(status, body);
    if (status < 200 || status >= 300) {
      throw chatopsHttpError(status, url, typeof body === "string" ? body : JSON.stringify(body));
    }
  }
}

function isLoginPage(body: string): boolean {
  const lower = body.toLowerCase();
  return lower.startsWith("<!") && (lower.includes("log in") || lower.includes("login") || lower.includes("sso"));
}
