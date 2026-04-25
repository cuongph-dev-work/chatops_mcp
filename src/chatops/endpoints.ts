// ---------------------------------------------------------------------------
// ChatOps API v4 — endpoint URL builders
// All URLs are absolute (baseUrl + path). No trailing slashes.
// ---------------------------------------------------------------------------

const API = "/api/v4";

function url(base: string, path: string): string {
  return base.replace(/\/$/, "") + path;
}

// ── Teams ────────────────────────────────────────────────────────────────────

/** GET /api/v4/teams — list all teams the token can access */
export function teamsUrl(baseUrl: string): string {
  return url(baseUrl, `${API}/teams`);
}

/** GET /api/v4/teams/:teamId */
export function teamUrl(baseUrl: string, teamId: string): string {
  return url(baseUrl, `${API}/teams/${encodeURIComponent(teamId)}`);
}

/** POST /api/v4/teams/search — search teams by term */
export function searchTeamsUrl(baseUrl: string): string {
  return url(baseUrl, `${API}/teams/search`);
}

// ── Channels ─────────────────────────────────────────────────────────────────

/** GET /api/v4/teams/:teamId/channels — list public channels in a team */
export function teamChannelsUrl(baseUrl: string, teamId: string): string {
  return url(baseUrl, `${API}/teams/${encodeURIComponent(teamId)}/channels`);
}

/** POST /api/v4/teams/:teamId/channels/search — search channels in a team */
export function searchChannelsUrl(baseUrl: string, teamId: string): string {
  return url(baseUrl, `${API}/teams/${encodeURIComponent(teamId)}/channels/search`);
}

/** GET /api/v4/channels/:channelId */
export function channelUrl(baseUrl: string, channelId: string): string {
  return url(baseUrl, `${API}/channels/${encodeURIComponent(channelId)}`);
}

/** GET /api/v4/teams/:teamId/channels/name/:channelName — lookup by slug */
export function channelByNameUrl(
  baseUrl: string,
  teamId: string,
  channelName: string
): string {
  return url(
    baseUrl,
    `${API}/teams/${encodeURIComponent(teamId)}/channels/name/${encodeURIComponent(channelName)}`
  );
}

// ── Posts ────────────────────────────────────────────────────────────────────

/** GET /api/v4/channels/:channelId/posts — list posts in a channel */
export function channelPostsUrl(baseUrl: string, channelId: string): string {
  return url(baseUrl, `${API}/channels/${encodeURIComponent(channelId)}/posts`);
}

/** GET /api/v4/posts/:postId/thread — get a thread */
export function postThreadUrl(baseUrl: string, postId: string): string {
  return url(baseUrl, `${API}/posts/${encodeURIComponent(postId)}/thread`);
}

/** GET /api/v4/channels/:channelId/pinned — get pinned posts */
export function pinnedPostsUrl(baseUrl: string, channelId: string): string {
  return url(baseUrl, `${API}/channels/${encodeURIComponent(channelId)}/pinned`);
}

/** POST /api/v4/posts — create a post */
export function postsUrl(baseUrl: string): string {
  return url(baseUrl, `${API}/posts`);
}

// ── Files ────────────────────────────────────────────────────────────────────

/** POST /api/v4/files — upload file(s) */
export function filesUrl(baseUrl: string): string {
  return url(baseUrl, `${API}/files`);
}
