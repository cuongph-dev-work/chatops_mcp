# chatops-mcp — Agent Instructions

This document is the authoritative guide for AI agents and developers working on **chatops-mcp** — an MCP server for ChatOps, an internal messaging platform (API-compatible with Mattermost v4).

---

## Project Purpose

chatops-mcp exposes ChatOps capabilities as MCP tools:
- **Read**: teams, channels, messages, threads, pinned posts
- **Write**: send messages, reply to threads, upload files, send messages with attachments

Authentication uses a **Bearer token** (`CHATOPS_TOKEN`) provided via environment variable. There is no session management, no Playwright, no cookie store.

---

## Architecture

```
chatops-mcp/
├── src/
│   ├── server.ts               # Entry point — MCP server factory, tool registration
│   ├── config.ts               # Zod env validation (CHATOPS_URL, CHATOPS_TOKEN)
│   ├── errors.ts               # McpError + factory helpers
│   ├── types.ts                # Normalized domain types (ChatOpsTeam, Channel, Post…)
│   ├── utils.ts                # Shared helpers (formatFileSize, channelTypeLabel…)
│   ├── chatops/
│   │   ├── http-client.ts      # ChatOpsHttpClient — all HTTP calls live here
│   │   ├── endpoints.ts        # URL builders for /api/v4/* paths
│   │   └── mappers.ts          # Raw API types → domain types
│   ├── types/
│   │   └── chatops-api.ts      # Raw API response shapes (never used outside mappers)
│   ├── tools/                  # One file per tool, handler function only
│   └── tests/                  # Unit tests (vitest)
└── docs/
    ├── tools/                  # One markdown doc per tool
    └── tools-quality-checklist.md
```

### Key design rules

1. **HTTP through `ChatOpsHttpClient` only** — tools never call `axios` directly.
2. **Two-layer types**: `src/types/chatops-api.ts` (raw, internal) and `src/types.ts` (domain, exposed).
3. **Mappers own the translation** — `src/chatops/mappers.ts` is the only code that converts raw → domain.
4. **Tool handlers are thin** — call client method → format output → return. No HTTP logic in tools.
5. **Errors via `McpError`** — all layers throw `McpError`; tool handlers catch with `isMcpError()` guard.
6. **Auth failure** — `ChatOpsHttpClient.assertOk()` detects 401/403 and throws `authError()`.

---

## Coding Standards

- **TypeScript strict** — `"strict": true` in tsconfig. No `any` without comment.
- **ESM imports** — all internal imports use `.js` extension (NodeNext resolution).
- **No `console.log`** — use `process.stderr.write()` for diagnostics only.
- **Tool response shape**:
  ```typescript
  // Success
  { content: [{ type: "text", text: "..." }] }
  // Error
  { content: [{ type: "text", text: "Error message" }], isError: true }
  ```
- **Error propagation**: `isMcpError(err) ? err.message : String(err)` — never expose stack traces.

---

## File Conventions

| Type | Location | Naming |
|------|----------|--------|
| Tool handler | `src/tools/<verb>-<noun>.ts` | `handleVerbNoun()` |
| Tool doc | `docs/tools/chatops_<verb>_<noun>.md` | snake_case |
| Raw API type | `src/types/chatops-api.ts` | `ChatOpsRaw*` prefix |
| Domain type | `src/types.ts` | `ChatOps*` prefix |
| Unit test | `src/tests/<module>.test.ts` | mirrors source |

---

## Adding a New Tool

Follow these steps exactly:

### 1. Add client method (if needed)
Open `src/chatops/http-client.ts` → add a method following the existing pattern:
```typescript
async getSomething(id: string): Promise<ChatOpsSomething> {
  const endpoint = somethingUrl(this.baseUrl, id);
  const res = await this.http.get<ChatOpsRawSomething>(endpoint);
  this.assertOk(res.status, endpoint, res.data);
  return mapSomething(res.data as ChatOpsRawSomething);
}
```

### 2. Add endpoint URL builder
Open `src/chatops/endpoints.ts` → add a builder function:
```typescript
export function somethingUrl(baseUrl: string, id: string): string {
  return url(baseUrl, `${API}/something/${encodeURIComponent(id)}`);
}
```

### 3. Add raw type (if new shape)
Open `src/types/chatops-api.ts` → add `ChatOpsRawSomething` interface.

### 4. Add domain type (if new shape)
Open `src/types.ts` → add `ChatOpsSomething` interface.

### 5. Add mapper
Open `src/chatops/mappers.ts` → add `mapSomething()` function.

### 6. Create tool handler
Create `src/tools/<verb>-<noun>.ts`:
```typescript
import type { Config } from "../config.js";
import { ChatOpsHttpClient } from "../chatops/http-client.js";
import { isMcpError } from "../errors.js";
import { errorContent } from "../utils.js";

export interface VerbNounInput { ... }

export async function handleVerbNoun(
  input: VerbNounInput,
  cfg: Config
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const client = new ChatOpsHttpClient(cfg.CHATOPS_URL, cfg.CHATOPS_TOKEN);
  try {
    const result = await client.getSomething(input.id);
    // Format output as Markdown
    return { content: [{ type: "text", text: formatResult(result) }] };
  } catch (err) {
    const msg = isMcpError(err) ? err.message : String(err);
    return errorContent(`Failed to verb noun: ${msg}`);
  }
}
```

### 7. Register in server.ts
Open `src/server.ts` → import handler and add `server.tool(...)`:
```typescript
server.tool(
  "chatops_verb_noun",
  "Tool description for LLM.",
  {
    id: z.string().min(1).describe("The thing ID."),
  },
  async (input) => handleVerbNoun(input, config)
);
```

### 8. Write tests
Create `src/tests/<verb>-<noun>.test.ts` with at least:
- Happy path
- Empty result
- Error case

### 9. Write documentation
Create `docs/tools/chatops_verb_noun.md` following `docs/tools-quality-checklist.md`.

### 10. Verify
```bash
npx tsc --noEmit   # 0 errors
npm test           # all tests pass
```

---

## Testing

```bash
npm test            # vitest run (all tests)
npm run test:watch  # vitest watch mode
npx tsc --noEmit   # type check only
```

Tests import from `../chatops/`, `../types/`, etc. (relative from `src/tests/`).
Do **not** import from `../../` — this resolves outside `src/`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CHATOPS_URL` | ✅ | Base URL of the ChatOps instance, no trailing slash |
| `CHATOPS_TOKEN` | ✅ | Bearer token (Personal Access Token or Bot Token) |
| `LOG_LEVEL` | ❌ | `debug \| info \| warn \| error` (default: `info`) |

---

## Running Locally

```bash
cp .env.example .env
# Edit .env with real CHATOPS_URL and CHATOPS_TOKEN

npm run dev        # tsx src/server.ts (development)
npm run build      # tsc → dist/
npm start          # node dist/server.js

# Smoke test (list tools)
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/server.js
```

---

## MCP Client Configuration (Claude Desktop)

```json
{
  "mcpServers": {
    "chatops": {
      "command": "npx",
      "args": ["-y", "@cuongph.dev/chatops-mcp"],
      "env": {
        "CHATOPS_URL": "https://chatops.yourcompany.com",
        "CHATOPS_TOKEN": "your_token_here"
      }
    }
  }
}
```
