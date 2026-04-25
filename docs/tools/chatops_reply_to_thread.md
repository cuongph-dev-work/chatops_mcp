# chatops_reply_to_thread

## When to Use

Use to add a reply to an existing message thread in ChatOps. The reply is linked to the root post and grouped with the thread.

Use `chatops_send_message` instead when posting a new top-level message.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `rootPostId` | string | ✅ | — | ID of the root post to reply to |
| `channelId` | string | ✅ | — | Channel ID where the thread exists |
| `message` | string | ✅ | — | Reply text. Supports Markdown |

## Output

```
## ✅ Reply sent

- **Post ID**: `post_reply456`
- **Thread root**: `post_root123`
- **Channel**: `ch_abc123`
- **Sent at**: 2024-03-15T10:35:00.000Z

> Fixed! Rolled back the migration and staging is healthy again.
```

## Error Cases

| Condition | Message |
|-----------|---------|
| Root post not found | `Failed to send reply: ChatOps HTTP 404 ...` |
| Invalid channel | `Failed to send reply: ChatOps HTTP 403 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Reply to an existing thread:**
```
chatops_reply_to_thread rootPostId="post_root123" channelId="ch_abc123" message="Issue resolved ✅"
```

**Reply with Markdown formatting:**
```
chatops_reply_to_thread rootPostId="post_root123" channelId="ch_abc123" message="Root cause: **memory leak** in the cache layer. Fix deployed to prod."
```
