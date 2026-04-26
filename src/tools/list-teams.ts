import type { Config } from "../config.js";
import { createClient, errorContent } from "../utils.js";
import { isMcpError } from "../errors.js";
import type { ChatOpsTeam } from "../types.js";

export interface ListTeamsInput {
  page?: number;
  perPage?: number;
}

function formatTeam(t: ChatOpsTeam, index: number): string {
  const lines = [
    `${index + 1}. **${t.displayName}** (\`${t.name}\`)`,
    `   - ID: \`${t.id}\``,
    `   - Type: ${t.type}`,
  ];
  if (t.description) lines.push(`   - Description: ${t.description}`);
  return lines.join("\n");
}

export async function handleListTeams(
  input: ListTeamsInput,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const client = await createClient(cfg);
  try {
    const teams = await client.getTeams(input.page ?? 0, input.perPage ?? 60);

    if (teams.length === 0) {
      return {
        content: [{ type: "text", text: "No teams found." }],
      };
    }

    const lines = [
      `## ChatOps Teams (${teams.length})`,
      "",
      ...teams.map(formatTeam),
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  } catch (err) {
    const msg = isMcpError(err) ? err.message : String(err);
    return errorContent(`Failed to list teams: ${msg}`);
  }
}
