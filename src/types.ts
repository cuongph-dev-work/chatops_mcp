// ---------------------------------------------------------------------------
// Domain types — normalized, stable output shapes
// Used by tool handlers and returned to the MCP client.
// These are intentionally free of ChatOps API internals.
// ---------------------------------------------------------------------------

// ── Teams ───────────────────────────────────────────────────────────────────

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
