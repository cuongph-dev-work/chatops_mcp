import type { Config } from "../config.js";
import { ChatOpsHttpClient } from "../chatops/http-client.js";
import { isMcpError } from "../errors.js";
import { errorContent } from "../utils.js";

export interface GetTeamInput {
  teamId: string;
}

export async function handleGetTeam(
  input: GetTeamInput,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const client = new ChatOpsHttpClient(cfg.CHATOPS_URL, cfg.CHATOPS_TOKEN);
  try {
    const t = await client.getTeam(input.teamId);

    const lines = [
      `## ${t.displayName}`,
      "",
      `- **ID**: \`${t.id}\``,
      `- **Name (slug)**: \`${t.name}\``,
      `- **Type**: ${t.type}`,
      `- **Open invite**: ${t.allowOpenInvite ? "Yes" : "No"}`,
      `- **Created**: ${t.createdAt}`,
    ];
    if (t.description) lines.splice(2, 0, "", `> ${t.description}`);

    return { content: [{ type: "text", text: lines.join("\n") }] };
  } catch (err) {
    const msg = isMcpError(err) ? err.message : String(err);
    return errorContent(`Failed to get team "${input.teamId}": ${msg}`);
  }
}
