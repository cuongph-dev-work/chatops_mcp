# chatops_send_message_with_files

## When to Use

Use to post a message with one or more file attachments to a ChatOps channel. Files must be uploaded first via `chatops_upload_file`.

**Workflow:**
1. `chatops_upload_file` → receive `fileId` per file
2. `chatops_send_message_with_files` → post message + fileIds together

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channelId` | string | ✅ | — | Channel ID to post into |
| `message` | string | ✅ | — | Message text (can be empty string `""`) |
| `fileIds` | string[] | ✅ | — | List of pre-uploaded file IDs (1–10) |
| `rootPostId` | string | No | — | Reply to this post ID (creates a thread reply with attachments) |

## Output

```
## ✅ Message with files sent

- **Post ID**: `post_msg456`
- **Channel**: `ch_abc123`
- **Attachments**: 2 file(s)
- **Sent at**: 2024-03-15T11:00:00.000Z

> Here is the weekly deploy report + error log for review.

**Attached files:**
1. deploy-report.pdf (245.6 KB) — `file_abc123`
2. error.log (12.3 KB) — `file_def456`
```

## Error Cases

| Condition | Message |
|-----------|---------|
| Empty fileIds | `fileIds must not be empty. Use chatops_send_message for text-only messages.` |
| Invalid file ID | `Failed to send message with files: ChatOps HTTP 400 ...` |
| Invalid channel | `Failed to send message with files: ChatOps HTTP 403/404 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Send message with one attachment:**
```
chatops_send_message_with_files channelId="ch_abc123" message="Weekly report attached" fileIds=["file_abc123"]
```

**Reply to thread with attachment:**
```
chatops_send_message_with_files channelId="ch_abc123" message="Here is the fix" fileIds=["file_patch1"] rootPostId="post_root123"
```
