import type { Config } from "../config.js";
import { ChatOpsHttpClient } from "../chatops/http-client.js";
import { isMcpError } from "../errors.js";
import { errorContent } from "../utils.js";

export interface SendMessageInput {
  channelId: string;
  message: string;
}

export async function handleSendMessage(
  input: SendMessageInput,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const client = new ChatOpsHttpClient(cfg.CHATOPS_URL, cfg.CHATOPS_TOKEN);
  try {
    const post = await client.createPost(input.channelId, input.message);

    const lines = [
      "## ✅ Message sent",
      "",
      `- **Post ID**: \`${post.id}\``,
      `- **Channel**: \`${post.channelId}\``,
      `- **Sent at**: ${post.createdAt}`,
      "",
      `> ${post.message.slice(0, 200)}${post.message.length > 200 ? "…" : ""}`,
    ];

    return { content: [{ type: "text", text: lines.join("\n") }] };
  } catch (err) {
    const msg = isMcpError(err) ? err.message : String(err);
    return errorContent(`Failed to send message: ${msg}`);
  }
}
