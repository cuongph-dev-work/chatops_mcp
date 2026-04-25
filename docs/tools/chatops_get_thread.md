# chatops_get_thread

## When to Use

Use to read the full conversation thread rooted at a given post. Returns the root post and all replies in chronological order. Useful when a user wants to follow a discussion without noise from the rest of the channel.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `postId` | string | ✅ | — | ID of the **root post** of the thread |

## Output

```
## Thread (`post_root123`) — 4 message(s)

📌 Root — `post_root123` | **2024-03-15T09:00** | `user_alice`
Anyone seen the deploy fail on staging?

---
  ↳ Reply — `post_reply1` | **2024-03-15T09:05** | `user_bob`
Yes, looks like a DB migration issue. Checking now.

---
  ↳ Reply — `post_reply2` | **2024-03-15T09:12** | `user_alice`
Found it — missing index on the users table. Fix pushed.
📎 fix-migration.sql (2.1 KB)

---
  ↳ Reply — `post_reply3` | **2024-03-15T09:20** | `user_bob`
Confirmed fixed. Deploying again.
```

## Error Cases

| Condition | Message |
|-----------|---------|
| No posts in thread | `No posts found in thread \`<postId>\`.` |
| Post not found | `Failed to get thread: ChatOps HTTP 404 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Read a full thread:**
```
chatops_get_thread postId="post_root123abc"
```
