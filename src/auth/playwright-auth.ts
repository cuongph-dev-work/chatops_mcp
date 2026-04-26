import { chromium, firefox, webkit } from "playwright";
import { writeSession } from "./session-store.js";
import { extractCookies } from "./session-manager.js";
import axios from "axios";
import type { SessionFile } from "../types.js";

type BrowserEngine = "chromium" | "firefox" | "webkit";

// ---------------------------------------------------------------------------
// Interactive SSO login
// ---------------------------------------------------------------------------

/**
 * Launches a browser, navigates to the ChatOps base URL, and polls the API
 * every few seconds until the session is authenticated.
 *
 * No URL pattern matching — works with any SSO flow regardless of URL shape.
 */
export async function runInteractiveLogin(options: {
  baseUrl: string;
  sessionFilePath: string;
  headless: boolean;
  browser: BrowserEngine;
  validatePath?: string;
}): Promise<void> {
  const {
    baseUrl,
    sessionFilePath,
    headless,
    browser: browserName,
    validatePath = "/api/v4/users/me",
  } = options;

  console.log(`\n🔐 Launching ${browserName} to authenticate with ChatOps...\n`);
  console.log(`   Base URL : ${baseUrl}`);
  console.log(`   Session  : ${sessionFilePath}\n`);

  const browserFactory = getBrowserFactory(browserName);
  const browserInstance = await browserFactory.launch({ headless });
  const context = await browserInstance.newContext();
  const page = await context.newPage();

  await page.goto(baseUrl);

  console.log("👉 Complete the SSO login in the browser window.");
  console.log("   Waiting for you to reach the ChatOps dashboard...\n");

  // While on SSO domain/paths → skip API call (user is still filling the form)
  // When back on ChatOps domain → validate session via API
  const ssoDomains = ["sso.runsystem.vn"];
  const ssoPaths = ["/login", "/sso", "/idp", "/auth", "/saml", "/oauth", "/openid-connect"];

  const POLL_INTERVAL_MS = 2_000;
  const TIMEOUT_MS = 300_000; // 5 minutes
  const deadline = Date.now() + TIMEOUT_MS;

  let savedStorageState: Awaited<ReturnType<typeof context.storageState>> | null = null;

  while (Date.now() < deadline) {
    await page.waitForTimeout(POLL_INTERVAL_MS);

    const currentUrl = page.url();
    const onSsoPage =
      ssoDomains.some((d) => currentUrl.includes(d)) ||
      ssoPaths.some((p) => currentUrl.includes(p));

    // Still on SSO page — no point calling the API yet
    if (onSsoPage) {
      process.stdout.write("⏳ Waiting for login...\n");
      continue;
    }

    // Back on ChatOps domain — validate the session
    const currentState = await context.storageState();
    const candidate: SessionFile = {
      savedAt: new Date().toISOString(),
      baseUrl,
      storageState: currentState,
    };

    const valid = await validateCandidateSession(candidate, baseUrl, validatePath);
    if (valid) {
      savedStorageState = currentState;
      break;
    }

    process.stdout.write("⏳ Validating session...\n");
  }

  await browserInstance.close();

  if (!savedStorageState) {
    throw new Error("Login timed out after 5 minutes. Please run chatops-auth-login again.");
  }

  const session: SessionFile = {
    savedAt: new Date().toISOString(),
    baseUrl,
    storageState: savedStorageState,
  };

  await writeSession(sessionFilePath, session);

  console.log(`\n✅ Session saved to ${sessionFilePath}`);
  console.log(`   Saved at : ${session.savedAt}\n`);
}

// ---------------------------------------------------------------------------
// Candidate session validation (no disk side-effects)
// ---------------------------------------------------------------------------

/**
 * Returns true if the candidate SessionFile produces a 2xx response from ChatOps.
 * Never throws — returns false on any failure.
 */
export async function validateCandidateSession(
  candidate: SessionFile,
  baseUrl: string,
  validatePath: string
): Promise<boolean> {
  const cookies = extractCookies(candidate, baseUrl);
  const validateUrl = `${baseUrl.replace(/\/$/, "")}${validatePath}`;

  try {
    const res = await axios.get(validateUrl, {
      headers: { Cookie: cookies.cookieHeader, Accept: "application/json" },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    if (typeof res.data === "string" && isLoginPage(res.data)) return false;
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function getBrowserFactory(name: BrowserEngine) {
  switch (name) {
    case "firefox": return firefox;
    case "webkit": return webkit;
    default: return chromium;
  }
}

function isLoginPage(body: string): boolean {
  const lower = body.toLowerCase();
  return lower.startsWith("<!") && (lower.includes("log in") || lower.includes("login") || lower.includes("sso"));
}

export { readSession } from "./session-store.js";
