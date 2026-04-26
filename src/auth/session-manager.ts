import axios from "axios";
import { readSession } from "./session-store.js";
import { authRequired, sessionExpired } from "../errors.js";
import type { PlaywrightCookie, SessionCookies, SessionFile } from "../types.js";

// ---------------------------------------------------------------------------
// Cookie extraction
// ---------------------------------------------------------------------------

/**
 * Converts Playwright cookie objects into an HTTP Cookie header string.
 * Only includes cookies whose domain matches the base URL host.
 */
export function extractCookies(session: SessionFile, baseUrl: string): SessionCookies {
  const host = new URL(baseUrl).hostname;

  const matched: PlaywrightCookie[] = session.storageState.cookies?.filter(
    (c: PlaywrightCookie) => host.endsWith(c.domain.replace(/^\./, ""))
  ) ?? [];

  const cookieHeader = matched.map((c) => `${c.name}=${c.value}`).join("; ");

  return { cookieHeader };
}

// ---------------------------------------------------------------------------
// Session validation
// ---------------------------------------------------------------------------

/**
 * Loads the session from disk and validates it against the ChatOps REST API.
 *
 * Throws:
 * - `AUTH_REQUIRED` if no session file exists
 * - `SESSION_EXPIRED` if the session exists but ChatOps rejects it
 */
export async function loadAndValidateSession(
  sessionFilePath: string,
  baseUrl: string,
  validatePath: string
): Promise<SessionCookies> {
  const session = await readSession(sessionFilePath);

  if (session === null) {
    throw authRequired();
  }

  const cookies = extractCookies(session, baseUrl);
  const validateUrl = `${baseUrl.replace(/\/$/, "")}${validatePath}`;

  try {
    const res = await axios.get(validateUrl, {
      headers: {
        Cookie: cookies.cookieHeader,
        Accept: "application/json",
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    if (isLoginPageResponse(res.data)) {
      throw sessionExpired();
    }

    return cookies;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (
        status === 401 ||
        status === 403 ||
        (status !== undefined && status >= 300 && status < 400)
      ) {
        throw sessionExpired();
      }
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isLoginPageResponse(body: unknown): boolean {
  if (typeof body !== "string") return false;
  const lower = body.toLowerCase();
  return (
    lower.startsWith("<!") &&
    (lower.includes("log in") || lower.includes("login") || lower.includes("sso"))
  );
}

function isAxiosError(err: unknown): err is { response?: { status: number } } {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAxiosError" in err &&
    (err as { isAxiosError: boolean }).isAxiosError === true
  );
}
