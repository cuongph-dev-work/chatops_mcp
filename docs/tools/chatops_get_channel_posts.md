# chatops_get_channel_posts

## When to Use

Use to read message history in a channel. Posts are returned newest-first. Use `page` and `perPage` to paginate through history. Each post shows author, timestamp, message content, and attachment count.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channelId` | string | ✅ | — | ChatOps channel ID |
| `page` | integer | No | `0` | 0-based page number (0 = most recent) |
| `perPage` | integer | No | `30` | Posts per page (1–200) |

## Output

```
## Posts in channel `ch_abc123` (30 shown)

1. **[2024-03-15T10:23]** `user_alice`
   Deploy complete — v2.3.1 is now live on production 🚀
   ID: `post_111`

2. **[2024-03-15T10:20]** `user_bob`
   Starting deployment for v2.3.1...
   📎 1 attachment(s)
   ID: `post_110`
```

> Reply posts are shown with `↳` prefix and indented.

## Notes

- Deleted posts are automatically filtered out
- System messages (join/leave) are included unless `type` filtering is added
- To read a thread, use `chatops_get_thread` with a post ID

## Error Cases

| Condition | Message |
|-----------|---------|
| No posts | `No posts found in channel \`<channelId>\`.` |
| Invalid channel | `Failed to get channel posts: ChatOps HTTP 404 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Read latest 30 posts:**
```
chatops_get_channel_posts channelId="ch_abc123"
```

**Read older posts (page 2):**
```
chatops_get_channel_posts channelId="ch_abc123" page=1 perPage=20
```
