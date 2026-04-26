#!/usr/bin/env node
/**
 * CLI: chatops-auth-check
 *
 * Validates whether the stored ChatOps session is still alive.
 * Exits 0 if valid, exits 1 if expired or missing.
 */
import "dotenv/config";
import { config } from "../config.js";
import { loadAndValidateSession } from "../auth/session-manager.js";
import { readSession } from "../auth/session-store.js";
import { isMcpError } from "../errors.js";

(async () => {
  try {
    const session = await readSession(config.CHATOPS_SESSION_FILE);
    if (!session) {
      console.log("❌ No session found.");
      console.log(`   Expected file: ${config.CHATOPS_SESSION_FILE}`);
      console.log("   Run: chatops-auth-login\n");
      process.exit(1);
    }

    console.log(`📄 Session file   : ${config.CHATOPS_SESSION_FILE}`);
    console.log(`   Saved at       : ${session.savedAt}`);
    console.log(`   Base URL       : ${session.baseUrl}`);
    console.log(`   Cookies stored : ${session.storageState.cookies?.length ?? 0}`);
    console.log(`\n🔍 Validating against ${config.CHATOPS_URL}${config.CHATOPS_VALIDATE_PATH} ...`);

    await loadAndValidateSession(
      config.CHATOPS_SESSION_FILE,
      config.CHATOPS_URL,
      config.CHATOPS_VALIDATE_PATH
    );

    console.log("✅ Session is valid. You are authenticated with ChatOps.\n");
    process.exit(0);
  } catch (err: unknown) {
    if (isMcpError(err)) {
      console.error(`\n❌ [${err.code}] ${err.message}`);
      console.error("   Run: chatops-auth-login\n");
    } else {
      console.error("\n❌ Unexpected error:", err);
    }
    process.exit(1);
  }
})();
