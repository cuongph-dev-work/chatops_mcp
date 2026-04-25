# chatops_list_teams

## When to Use

Use this tool to discover all ChatOps teams that the current token has access to. Typically the first step when the user asks about teams, channels, or wants to navigate the ChatOps workspace.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | `0` | 0-based page number for pagination |
| `perPage` | integer | No | `60` | Teams per page (1–200) |

## Output

A Markdown-formatted list of teams with their ID, slug name, type, and description.

```
## ChatOps Teams (3)

1. **Engineering** (`engineering`)
   - ID: `abc123`
   - Type: open
   - Description: Engineering team workspace

2. **Product** (`product`)
   - ID: `def456`
   - Type: open
```

## Error Cases

| Condition | Message |
|-----------|---------|
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |
| Network error | `Failed to list teams: <error detail>` |
| No teams found | `No teams found.` |

## Examples

**List all teams (first page):**
```
chatops_list_teams
```

**Paginate (page 2, 20 per page):**
```
chatops_list_teams page=1 perPage=20
```
