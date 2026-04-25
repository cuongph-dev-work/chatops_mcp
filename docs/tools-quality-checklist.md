# Tools Quality Checklist

Apply this checklist to every tool before merging. All items must pass.

---

## 1. Input Schema

- [ ] All required params have `.describe()` with clear, LLM-friendly text
- [ ] Optional params have `.optional().default()` with sensible defaults
- [ ] IDs use `z.string().min(1)` (not just `z.string()`)
- [ ] Numeric ranges are bounded (`z.number().int().min(1).max(200)`)
- [ ] Enum params use `z.enum([...])` with all valid values listed in `.describe()`

## 2. Handler Structure

- [ ] Handler is in `src/tools/<verb>-<noun>.ts` — single exported function
- [ ] Function signature: `async (input: XInput, cfg: Config): Promise<{ content: ..., isError?: boolean }>`
- [ ] Client is instantiated inside handler: `new ChatOpsHttpClient(cfg.CHATOPS_URL, cfg.CHATOPS_TOKEN)`
- [ ] Error catch uses `isMcpError(err) ? err.message : String(err)` pattern
- [ ] No `console.log` — diagnostics to `process.stderr.write` only

## 3. Output Formatting

- [ ] Success output is valid Markdown
- [ ] Result counts are shown: `## X Results (N)`
- [ ] Empty results return a user-friendly message (not empty string)
- [ ] Long fields (message body) are truncated with `…` suffix
- [ ] Timestamps are ISO 8601 (`createdAt.slice(0, 16)` for display)
- [ ] File sizes use `sizeFormatted` (e.g. `2.3 MB`), not raw bytes
- [ ] IDs are shown in code backticks: `` `id` ``

## 4. Error Handling

- [ ] Auth errors (`authError()`) produce `isError: true` with clear message
- [ ] HTTP errors include status code and endpoint URL
- [ ] Input validation errors identify the invalid param
- [ ] No stack traces or internal details leaked to user

## 5. Registration in server.ts

- [ ] Tool name follows `chatops_<verb>_<noun>` pattern (snake_case)
- [ ] Tool description gives LLM enough context to choose this tool correctly
- [ ] Zod schema in `server.tool()` matches `XInput` interface exactly
- [ ] Handler imported with `.js` extension

## 6. Documentation

- [ ] `docs/tools/chatops_<verb>_<noun>.md` exists
- [ ] Doc includes: When to Use, Input (table), Output (example), Error Cases, Examples
- [ ] Examples show realistic ChatOps IDs and values

## 7. Tests

- [ ] At least one happy-path test
- [ ] Empty result case tested
- [ ] Error case tested (auth error or HTTP error)
- [ ] `npm test` passes with 0 failures
- [ ] `npx tsc --noEmit` passes with 0 errors
