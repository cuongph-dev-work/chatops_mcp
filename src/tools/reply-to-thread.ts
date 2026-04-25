import type { Config } from "../config.js";
import { ChatOpsHttpClient } from "../chatops/http-client.js";
import { isMcpError } from "../errors.js";
import { errorContent } from "../utils.js";

export interface ReplyToThreadInput {
  rootPostId: string;
  channelId: string;
  message: string;
}

export async function handleReplyToThread(
  input: ReplyToThreadInput,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const client = new ChatOpsHttpClient(cfg.CHATOPS_URL, cfg.CHATOPS_TOKEN);
  try {
    const post = await client.createPost(
      input.channelId,
      input.message,
      input.rootPostId
    );

    const lines = [
      "## ✅ Reply sent",
      "",
      `- **Post ID**: \`${post.id}\``,
      `- **Thread root**: \`${post.rootId}\``,
      `- **Channel**: \`${post.channelId}\``,
      `- **Sent at**: ${post.createdAt}`,
      "",
      `> ${post.message.slice(0, 200)}${post.message.length > 200 ? "…" : ""}`,
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  } catch (err) {
    const msg = isMcpError(err) ? err.message : String(err);
    return errorContent(`Failed to send reply: ${msg}`);
  }
}
