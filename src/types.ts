// ---------------------------------------------------------------------------
// Domain types — normalized, stable output shapes
// Used by tool handlers and returned to the MCP client.
// These are intentionally free of ChatOps API internals.
// ---------------------------------------------------------------------------

// ── Teams ───────────────────────────────────────────────────────────────────

// ── Auth / Session ───────────────────────────────────────────────────────────

/** Shape of a single Playwright-persisted cookie. */
export interface PlaywrightCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

/** Top-level shape written by `session-store.writeSession`. */
export interface SessionFile {
  savedAt: string;    // ISO 8601
  baseUrl: string;
  storageState: {
    cookies?: PlaywrightCookie[];
    origins?: unknown[];
  };
}

/** Extracted, ready-to-use form of the session for HTTP calls. */
export interface SessionCookies {
  cookieHeader: string;   // e.g. "MMAUTHTOKEN=abc; MMUSERID=xyz"
}

export interface ChatOpsTeam {
  id: string;
  displayName: string;
  name: string;
  description: string;
  type: "open" | "invite-only";
  allowOpenInvite: boolean;
  createdAt: string;   // ISO 8601
}

// ── Channels ─────────────────────────────────────────────────────────────────

export interface ChatOpsChannel {
  id: string;
  teamId: string;
  type: "public" | "private" | "direct" | "group";
  displayName: string;
  name: string;
  header: string;
  purpose: string;
  totalMsgCount: number;
  lastPostAt: string;   // ISO 8601
}

// ── Posts ────────────────────────────────────────────────────────────────────

export interface ChatOpsPost {
  id: string;
  channelId: string;
  userId: string;
  rootId: string | null;   // null if top-level post
  message: string;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  fileIds: string[];
  files: ChatOpsFileInfo[];
}

export interface ChatOpsPostList {
  /** Ordered post IDs (newest first by default) */
  order: string[];
  posts: ChatOpsPost[];
  totalCount: number;
}

// ── Files ────────────────────────────────────────────────────────────────────

export interface ChatOpsFileInfo {
  id: string;
  name: string;
  extension: string;
  size: number;
  sizeFormatted: string;   // e.g. "2.3 MB"
  mimeType: string;
}

export interface ChatOpsFileUploadResult {
  fileId: string;
  name: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
}

// ── Reactions ────────────────────────────────────────────────────────────────

export interface ChatOpsReaction {
  userId: string;
  postId: string;
  emojiName: string;
  createdAt: string;   // ISO 8601
}

// ── Emoji ────────────────────────────────────────────────────────────────────

export interface ChatOpsEmoji {
  id: string;
  creatorId: string;
  name: string;        // emoji slug — use as :name: in messages
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}
