# chatops_get_team

## When to Use

Use when you have a team ID and need its full details — type, open invite status, description, and creation date. Useful after finding an ID from `chatops_list_teams` or `chatops_search_teams`.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `teamId` | string | ✅ | — | ChatOps team ID (26-character alphanumeric string) |

## Output

Detailed Markdown view of the team.

```
## Engineering

> Main engineering workspace for all squads.

- **ID**: `abc123xyz`
- **Name (slug)**: `engineering`
- **Type**: open
- **Open invite**: Yes
- **Created**: 2023-01-15T08:00:00.000Z
```

## Error Cases

| Condition | Message |
|-----------|---------|
| Team not found | `Failed to get team "xyz": ChatOps HTTP 404 from ...` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Get team by ID:**
```
chatops_get_team teamId="abc123xyz789def"
```
