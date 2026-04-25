# chatops_send_message

## When to Use

Use to post a new message to a ChatOps channel. The message will appear as a top-level post (not a thread reply). Supports Markdown formatting.

To reply to an existing message/thread, use `chatops_reply_to_thread` instead.
To send a message with files, use `chatops_send_message_with_files`.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channelId` | string | ✅ | — | ChatOps channel ID to post into |
| `message` | string | ✅ | — | Message text. Supports Markdown (bold, code, links, lists) |

## Output

```
## ✅ Message sent

- **Post ID**: `post_newmsg123`
- **Channel**: `ch_abc123`
- **Sent at**: 2024-03-15T10:30:00.000Z

> Hello team! Deployment for v2.4.0 starts in 10 minutes. Please…
```

## Error Cases

| Condition | Message |
|-----------|---------|
| Empty message | Zod validation error (blocked before API call) |
| Invalid channel | `Failed to send message: ChatOps HTTP 403/404 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Send a plain message:**
```
chatops_send_message channelId="ch_abc123" message="Deployment complete ✅"
```

**Send a Markdown message:**
```
chatops_send_message channelId="ch_abc123" message="**Alert**: Database CPU at 95% — investigating"
```
