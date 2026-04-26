// ---------------------------------------------------------------------------
// Internal error taxonomy for the ChatOps MCP server
// ---------------------------------------------------------------------------

export type ErrorCode =
  | "AUTH_REQUIRED"
  | "SESSION_EXPIRED"
  | "AUTH_ERROR"
  | "CHATOPS_HTTP_ERROR"
  | "CHATOPS_RESPONSE_ERROR"
  | "CONFIG_ERROR"
  | "INVALID_INPUT";

/**
 * Structured internal error. All layers throw this instead of plain Error
 * so callers can discriminate on `code` without string-matching messages.
 */
export class McpError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "McpError";
    this.code = code;
    this.details = details;
    // Maintain proper prototype chain in ES2022 + TS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Factory helpers — keeps call sites concise
// ---------------------------------------------------------------------------

export function authRequired(
  message = "No ChatOps session found. Run `chatops-auth-login` to authenticate."
): McpError {
  return new McpError("AUTH_REQUIRED", message);
}

export function sessionExpired(
  message = "ChatOps session expired or rejected. Run `chatops-auth-login` to reauthenticate."
): McpError {
  return new McpError("SESSION_EXPIRED", message);
}

/** @deprecated Kept for backward-compat — prefer sessionExpired() */
export function authError(message?: string): McpError {
  return sessionExpired(message);
}

export function chatopsHttpError(status: number, url: string, body?: string): McpError {
  return new McpError(
    "CHATOPS_HTTP_ERROR",
    `ChatOps HTTP ${status} from ${url}`,
    { status, url, body }
  );
}

export function chatopsResponseError(message: string, raw?: unknown): McpError {
  return new McpError("CHATOPS_RESPONSE_ERROR", message, raw);
}

export function configError(message: string, details?: unknown): McpError {
  return new McpError("CONFIG_ERROR", message, details);
}

export function invalidInput(message: string, details?: unknown): McpError {
  return new McpError("INVALID_INPUT", message, details);
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isMcpError(err: unknown): err is McpError {
  return err instanceof McpError;
}
