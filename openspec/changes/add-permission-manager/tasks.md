## 1. Scaffold and registration

- [ ] 1.1 Create `extensions/permission-manager/` with `index.ts` exporting a default `ExtensionAPI` function (async if dynamic imports are needed)
- [ ] 1.2 Add `./extensions/permission-manager` to `package.json` `pi.extensions` in the correct order relative to `ai-provider-connect` and `security-engine`
- [ ] 1.3 Document load-order rationale in `index.ts` header comment (mirror `ai-provider-connect` / `security-engine` style)

## 2. Policy loading and validation

- [ ] 2.1 Implement resolver for `~/.devopet/permissions.jsonc` and optional `.devopet/permissions.jsonc` with local-over-global merge rules per spec
- [ ] 2.2 Validate `defaultPolicy` and category maps; reject invalid `allow`/`deny`/`ask` tokens with actionable errors
- [ ] 2.3 Align shape with **pi-permission-system** documented schema; add inline references to upstream README where fields match

## 3. Hooks and enforcement

- [ ] 3.1 Register `before_agent_start` / `tool_call` / bash (and MCP/skills/special per Pi API availability) to apply allow/deny/ask
- [ ] 3.2 Integrate with `security-engine`: remove or gate direct `pi-permission-system` import so only one enforcement path runs; keep integrity/guard ordering as needed
- [ ] 3.3 Ensure default `deny`; `ask` blocks until user decision; update local or global config with user decision
- [ ] 3.4 Document in `index.ts` (or `README` under the extension) that **OS-level sandboxing is not a substitute** for these hooks for in-process tools; if bash OS sandbox is ever composed in, bash policy and prompts still go through this hook layer per spec

## 4. Interactive elevation (pi-sandbox-inspired)

- [ ] 4.1 Implement prompt flow: abort, allow once, allow for session; allow for project; allow globally; optional persist allow per design;
- [ ] 4.2 Add session-scoped allow cache keyed by rule class; clear on session end if required by Pi lifecycle
- [ ] 4.3 Prevent duplicate prompts for the same gated action after session allow (integration test)

## 5. Config, docs, and tests

- [ ] 5.1 Add or update `config/permissions.example.jsonc` to match implemented schema
- [ ] 5.2 Add `tests/permission-manager.test.ts` (or extend existing) for parse errors, merge precedence, YOLO when no config files, and at least one hook/permission path when policy exists
- [ ] 5.3 Run `npm run check` (typecheck + tests) and fix regressions

## 6. Footer and YOLO

- [ ] 6.1 On `session_start` (when `ctx.hasUI`), call `ctx.ui.setStatus("permission-manager", …)` with **`YOLO`** when neither `~/.devopet/permissions.jsonc` nor `.devopet/permissions.jsonc` exists; otherwise show **policy** active (short text per theme conventions)
- [ ] 6.2 Update **`security-engine`** and/or **`extensions/dashboard/footer.ts`** (or equivalent) so **message-integrity**, **security-guard**, **perms**, and **secure** appear in the footer/status strip per spec—via multiple `setStatus` keys or one aggregated line
- [ ] 6.3 Document **YOLO** vs **policy** in `config/permissions.example.jsonc` header comment or extension README
