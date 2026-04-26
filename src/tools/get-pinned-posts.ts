import type { Config } from "../config.js";
import { createClient, errorContent } from "../utils.js";
import { isMcpError } from "../errors.js";
import type { ChatOpsPost } from "../types.js";

export interface GetPinnedPostsInput {
  channelId: string;
}

function formatPost(p: ChatOpsPost, index: number): string {
  const lines = [
    `${index + 1}. 📌 **[${p.createdAt.slice(0, 16)}]** \`${p.userId}\``,
    `   ${p.message.replace(/\n/g, " ").slice(0, 400)}${p.message.length > 400 ? "…" : ""}`,
    `   ID: \`${p.id}\``,
  ];
  if (p.files.length) {
    lines.push(`   📎 ${p.files.map((f) => f.name).join(", ")}`);
  }
  return lines.join("\n");
}

export async function handleGetPinnedPosts(
  input: GetPinnedPostsInput,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const client = await createClient(cfg);
  try {
    const postList = await client.getPinnedPosts(input.channelId);

    if (postList.posts.length === 0) {
      return {
        content: [{ type: "text", text: `No pinned posts found in channel \`${input.channelId}\`.` }],
      };
    }

    const lines = [
      `## Pinned Posts in \`${input.channelId}\` (${postList.totalCount})`,
      "",
      ...postList.posts.map(formatPost),
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  } catch (err) {
    const msg = isMcpError(err) ? err.message : String(err);
    return errorContent(`Failed to get pinned posts: ${msg}`);
  }
}
