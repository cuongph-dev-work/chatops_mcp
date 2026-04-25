# chatops_search_teams

## When to Use

Use when the user knows part of a team name and wants to find it quickly without listing all teams. More targeted than `chatops_list_teams` when the workspace has many teams.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `term` | string | ✅ | — | Search term matched against team name and display name |

## Output

A Markdown list of matching teams with ID, slug, type, and description.

```
## ChatOps Teams matching "eng" (2)

1. **Engineering** (`engineering`)
   - ID: `abc123`
   - Type: open
   - Description: Main engineering workspace

2. **Platform Engineering** (`platform-eng`)
   - ID: `xyz789`
   - Type: invite-only
```

## Error Cases

| Condition | Message |
|-----------|---------|
| No matches | `No teams found matching "<term>".` |
| Invalid token | `ChatOps returned 401/403 — check that CHATOPS_TOKEN is valid.` |

## Examples

**Search for teams with "eng":**
```
chatops_search_teams term="eng"
```

**Find a specific team:**
```
chatops_search_teams term="platform"
```
