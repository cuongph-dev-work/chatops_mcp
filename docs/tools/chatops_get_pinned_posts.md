# chatops_get_pinned_posts

## When to Use

Use to retrieve all posts that have been pinned in a channel. Pinned posts typically contain important announcements, runbooks, or reference links that the team wants to keep visible.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channelId` | string | ✅ | — | ChatOps channel ID |

## Output

```
## Pinned Posts in `ch_abc123` (3)

1. 📌 **[2024-01-10T09:00]** `user_alice`
   Team standup is daily at 9:30 AM in Zoom — link: https://zoom.us/j/...
   ID: `post_pin1`

2. 📌 **[2024-02-01T14:00]** `user_bob`
   Deployment runbook: see Confluence at https://wiki.example.com/deploy
   ID: `post_pin2`
   📎 deploy-checklist.pdf
```

## Error Cases

| Condition | Message |
|-----------|---------|
| No pinned posts | `No pinned posts found in channel \`<channelId>\`.` |
| Invalid channel | `Failed to get pinned posts: ChatOps HTTP 404 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Get all pinned posts:**
```
chatops_get_pinned_posts channelId="ch_abc123"
```
