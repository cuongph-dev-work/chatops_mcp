import { z } from "zod";
import { configError } from "./errors.js";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  CHATOPS_URL: z
    .string()
    .url("CHATOPS_URL must be a valid URL (e.g. https://chatops.yourcompany.com)"),

  CHATOPS_TOKEN: z
    .string()
    .min(1, "CHATOPS_TOKEN must not be empty"),

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
