# chatops_get_channel

## When to Use

Use to get full metadata for a single channel: type, purpose, header, message count. Supports two lookup modes — by channel ID (preferred) or by team ID + channel name slug.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `channelId` | string | Conditional | — | Channel ID (preferred). Provide this OR teamId+channelName. |
| `teamId` | string | Conditional | — | Team ID — required when looking up by `channelName` |
| `channelName` | string | Conditional | — | Channel slug/URL name (e.g. `general`). Used only if `channelId` not provided. |

> At least one of `channelId`, or both `teamId` + `channelName`, must be provided.

## Output

```
## # General

- **ID**: `ch_abc123`
- **Name (slug)**: `general`
- **Team ID**: `team_xyz`
- **Type**: public
- **Total messages**: 5432
- **Last post**: 2024-03-15T10:23:00.000Z
- **Purpose**: General team communication
- **Header**: Welcome to #general!
```

## Error Cases

| Condition | Message |
|-----------|---------|
| No params provided | `Provide either channelId, or both teamId and channelName.` |
| Channel not found | `Failed to get channel: ChatOps HTTP 404 ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**By channel ID:**
```
chatops_get_channel channelId="ch_abc123"
```

**By team + channel name:**
```
chatops_get_channel teamId="team_xyz" channelName="general"
```
