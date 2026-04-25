# chatops_list_channels

## When to Use

Use to list all public channels available in a given team. The standard entry point for channel discovery. For private channels the token must have membership access.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `teamId` | string | ✅ | — | ChatOps team ID |
| `page` | integer | No | `0` | 0-based page number |
| `perPage` | integer | No | `60` | Channels per page (1–200) |

## Output

A Markdown list of channels with icons indicating type (🔒 = private, # = public).

```
## Channels in team `abc123` (5)

1. # **General** (`general`)
   - ID: `ch_general`
   - Type: public | Messages: 1234

2. 🔒 **Engineering Private** (`engineering-private`)
   - ID: `ch_engprivate`
   - Type: private | Messages: 89
   - Purpose: Internal engineering discussions
```

## Error Cases

| Condition | Message |
|-----------|---------|
| Invalid team ID | `Failed to list channels: ChatOps HTTP 404 ...` |
| No channels | `No channels found in team \`<teamId>\`.` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**List channels in a team:**
```
chatops_list_channels teamId="abc123xyz"
```

**Paginate (second page):**
```
chatops_list_channels teamId="abc123xyz" page=1 perPage=30
```
