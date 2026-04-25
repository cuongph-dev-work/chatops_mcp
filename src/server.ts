#!/usr/bin/env node
// ---------------------------------------------------------------------------
// chatops-mcp — MCP server entry point
// ---------------------------------------------------------------------------
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from "./config.js";

// Tool handlers
import { handleListTeams } from "./tools/list-teams.js";
import { handleSearchTeams } from "./tools/search-teams.js";
import { handleGetTeam } from "./tools/get-team.js";
import { handleListChannels } from "./tools/list-channels.js";
import { handleSearchChannels } from "./tools/search-channels.js";
import { handleGetChannel } from "./tools/get-channel.js";
import { handleGetChannelPosts } from "./tools/get-channel-posts.js";
import { handleGetThread } from "./tools/get-thread.js";
import { handleGetPinnedPosts } from "./tools/get-pinned-posts.js";
import { handleSendMessage } from "./tools/send-message.js";
import { handleReplyToThread } from "./tools/reply-to-thread.js";
import { handleUploadFile } from "./tools/upload-file.js";
import { handleSendMessageWithFiles } from "./tools/send-message-with-files.js";

// ---------------------------------------------------------------------------
// MCP server factory
// ---------------------------------------------------------------------------

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "chatops-mcp",
    version: "0.1.0",
  });

  // ── Teams ────────────────────────────────────────────────────────────────

  server.tool(
    "chatops_list_teams",
    "List all ChatOps teams accessible with the current token. Returns team ID, display name, slug, type, and description.",
    {
      page: z.number().int().min(0).optional().default(0)
        .describe("0-based page number (default 0)."),
      perPage: z.number().int().min(1).max(200).optional().default(60)
        .describe("Number of teams per page (1–200, default 60)."),
    },
    async (input) => handleListTeams(input, config)
  );

  server.tool(
    "chatops_search_teams",
    "Search ChatOps teams by name/display name. Returns matching teams with ID, name, and type.",
    {
      term: z.string().min(1).describe("Search term to match against team names."),
    },
    async (input) => handleSearchTeams(input, config)
  );

  server.tool(
    "chatops_get_team",
    "Get detailed information about a single ChatOps team by its ID.",
    {
      teamId: z.string().min(1).describe("ChatOps team ID."),
    },
    async (input) => handleGetTeam(input, config)
  );

  // ── Channels ─────────────────────────────────────────────────────────────

  server.tool(
    "chatops_list_channels",
    "List public channels in a ChatOps team. Returns channel ID, name, type, message count, and purpose.",
    {
      teamId: z.string().min(1).describe("ChatOps team ID to list channels for."),
      page: z.number().int().min(0).optional().default(0)
        .describe("0-based page number (default 0)."),
      perPage: z.number().int().min(1).max(200).optional().default(60)
        .describe("Number of channels per page (1–200, default 60)."),
    },
    async (input) => handleListChannels(input, config)
  );

  server.tool(
    "chatops_search_channels",
    "Search channels in a ChatOps team by name or display name.",
    {
      teamId: z.string().min(1).describe("ChatOps team ID to search within."),
      term: z.string().min(1).describe("Search term to match against channel names."),
    },
    async (input) => handleSearchChannels(input, config)
  );

  server.tool(
    "chatops_get_channel",
    `Get detailed information about a single ChatOps channel.

Lookup modes:
- By channelId (preferred): provide channelId only.
- By name: provide both teamId and channelName (the URL slug).`,
    {
      channelId: z.string().optional()
        .describe("ChatOps channel ID (preferred lookup)."),
      teamId: z.string().optional()
        .describe("Team ID — required when looking up by channelName."),
      channelName: z.string().optional()
        .describe("Channel slug/name — used only when channelId is not provided."),
    },
    async (input) => handleGetChannel(input, config)
  );

  server.tool(
    "chatops_get_channel_posts",
    `Retrieve posts from a ChatOps channel, ordered newest-first.

Use page/perPage for pagination. Each post includes author, timestamp, message text, and attachment info.`,
    {
      channelId: z.string().min(1).describe("ChatOps channel ID."),
      page: z.number().int().min(0).optional().default(0)
        .describe("0-based page number (default 0)."),
      perPage: z.number().int().min(1).max(200).optional().default(30)
        .describe("Number of posts per page (1–200, default 30)."),
    },
    async (input) => handleGetChannelPosts(input, config)
  );

  // ── Threads & Pinned ─────────────────────────────────────────────────────

  server.tool(
    "chatops_get_thread",
    "Get all posts in a thread rooted at a given post ID. Returns the root post and all replies in order.",
    {
      postId: z.string().min(1).describe("ID of the root post of the thread."),
    },
    async (input) => handleGetThread(input, config)
  );

  server.tool(
    "chatops_get_pinned_posts",
    "Get all pinned posts in a ChatOps channel.",
    {
      channelId: z.string().min(1).describe("ChatOps channel ID."),
    },
    async (input) => handleGetPinnedPosts(input, config)
  );

  // ── Write ────────────────────────────────────────────────────────────────

  server.tool(
    "chatops_send_message",
    "Send a new message to a ChatOps channel. Returns the created post ID and timestamp.",
    {
      channelId: z.string().min(1).describe("ChatOps channel ID to post into."),
      message: z.string().min(1).describe("Message text to send. Supports Markdown."),
    },
    async (input) => handleSendMessage(input, config)
  );

  server.tool(
    "chatops_reply_to_thread",
    "Reply to an existing post/thread in ChatOps. The reply is linked to the root post.",
    {
      rootPostId: z.string().min(1).describe("ID of the root post to reply to."),
      channelId: z.string().min(1).describe("Channel ID where the thread exists."),
      message: z.string().min(1).describe("Reply message text. Supports Markdown."),
    },
    async (input) => handleReplyToThread(input, config)
  );

  server.tool(
    "chatops_upload_file",
    `Upload a local file to ChatOps and return the file ID.

The file ID can then be passed to chatops_send_message_with_files to attach it to a message.
The file must be accessible from the local filesystem.`,
    {
      channelId: z.string().min(1).describe("Channel ID where the file will be attached."),
      filePath: z.string().min(1).describe("Absolute or relative path to the local file to upload."),
    },
    async (input) => handleUploadFile(input, config)
  );

  server.tool(
    "chatops_send_message_with_files",
    `Send a message with one or more pre-uploaded file attachments.

Workflow:
1. Call chatops_upload_file for each file → get fileId(s)
2. Call this tool with the fileIds to post message + attachments together.`,
    {
      channelId: z.string().min(1).describe("ChatOps channel ID to post into."),
      message: z.string().describe("Message text (can be empty string if files speak for themselves)."),
      fileIds: z.array(z.string().min(1)).min(1).max(10)
        .describe("List of pre-uploaded file IDs (1–10). Get these from chatops_upload_file."),
      rootPostId: z.string().optional()
        .describe("Optional: reply to this post ID (creates a thread reply with attachments)."),
    },
    async (input) => handleSendMessageWithFiles(input, config)
  );

  return server;
}

// ---------------------------------------------------------------------------
// Stdio transport — one server, one connection (stdin/stdout)
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("chatops-mcp started (stdio)\n");
}

main().catch((err) => {
  process.stderr.write(`[chatops-mcp] Fatal error: ${String(err)}\n`);
  process.exit(1);
});
