# chatops_search_channels

## When to Use

Use when the user knows part of a channel name and wants to find it without scrolling through all channels. More targeted than `chatops_list_channels` in large teams.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `teamId` | string | ✅ | — | ChatOps team ID to search within |
| `term` | string | ✅ | — | Search term matched against channel name and display name |

## Output

Matching channels with type icons, IDs, message count, and purpose.

```
## Channels matching "release" (2)

1. # **Release Management** (`release-mgmt`)
   - ID: `ch_release`
   - Type: public | Messages: 302
   - Purpose: Release coordination

2. 🔒 **Release Internal** (`release-internal`)
   - ID: `ch_relint`
   - Type: private | Messages: 45
```

## Error Cases

| Condition | Message |
|-----------|---------|
| No matches | `No channels found matching "<term>" in team \`<teamId>\`.` |
| Invalid team | `Failed to search channels: ChatOps HTTP 404 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Search for release-related channels:**
```
chatops_search_channels teamId="abc123" term="release"
```

**Find the incident channel:**
```
chatops_search_channels teamId="abc123" term="incident"
```
