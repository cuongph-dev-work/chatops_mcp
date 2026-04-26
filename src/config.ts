import { z } from "zod";
import { configError } from "./errors.js";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  CHATOPS_URL: z
    .string()
    .url("CHATOPS_URL must be a valid URL (e.g. https://chatops.yourcompany.com)"),

  CHATOPS_SESSION_FILE: z
    .string()
    .default(".chatops/session.json")
    .describe("Path to the persisted Playwright session file"),

  CHATOPS_VALIDATE_PATH: z
    .string()
    .default("/api/v4/users/me")
    .describe("API path used to validate the session is still alive"),

  PLAYWRIGHT_HEADLESS: z
    .string()
    .default("false")
    .transform((v) => v.toLowerCase() === "true"),

  PLAYWRIGHT_BROWSER: z
    .enum(["chromium", "firefox", "webkit"])
    .default("chromium"),

  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),
});

export type Config = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Parse once at startup — callers import `config` directly
// ---------------------------------------------------------------------------

function loadConfig(): Config {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.errors
      .map((e) => `  ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw configError(`Invalid configuration:\n${messages}`, result.error);
  }
  return result.data;
}

export const config: Config = loadConfig();
