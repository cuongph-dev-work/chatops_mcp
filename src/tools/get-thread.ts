import type { Config } from "../config.js";
import { ChatOpsHttpClient } from "../chatops/http-client.js";
import { isMcpError } from "../errors.js";
import { errorContent } from "../utils.js";
import type { ChatOpsPost } from "../types.js";

export interface GetThreadInput {
  postId: string;
}

function formatPost(p: ChatOpsPost): string {
  const isReply = p.rootId !== null;
  const prefix = isReply ? "  ↳ Reply" : "📌 Root";
  const lines = [
    `${prefix} — \`${p.id}\` | **${p.createdAt.slice(0, 16)}** | \`${p.userId}\``,
    `${p.message}`,
  ];
  if (p.files.length) {
    lines.push(`📎 ${p.files.map((f) => `${f.name} (${f.sizeFormatted})`).join(", ")}`);
  }
  return lines.join("\n");
}

export async function handleGetThread(
  input: GetThreadInput,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const client = new ChatOpsHttpClient(cfg.CHATOPS_URL, cfg.CHATOPS_TOKEN);
  try {
    const postList = await client.getPostThread(input.postId);

    if (postList.posts.length === 0) {
      return {
        content: [{ type: "text", text: `No posts found in thread \`${input.postId}\`.` }],
      };
    }

    const lines = [
      `## Thread (\`${input.postId}\`) — ${postList.totalCount} message(s)`,
      "",
      ...postList.posts.map(formatPost).join("\n---\n").split("\n"),
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  } catch (err) {
    const msg = isMcpError(err) ? err.message : String(err);
    return errorContent(`Failed to get thread: ${msg}`);
  }
}
