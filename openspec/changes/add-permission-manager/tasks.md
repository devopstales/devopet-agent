## 1. Dependencies and compatibility

- [ ] 1.1 Verify peer version ranges: compare `pi-permission-system`, **`pi-connect`**, and optional `pi-sandbox` peer deps against devopet’s `@mariozechner/pi-coding-agent` / `pi-ai` / `pi-tui` versions; record matrix in design or a short `COMPAT.md` note if needed.
- [ ] 1.2 Add `pi-permission-system` and **`pi-connect`** to `package.json` `dependencies` with pinned/compatible versions; run `npm install` and fix any peer warnings.
- [ ] 1.3 If sandbox is in scope for this change, add `pi-sandbox` (and confirm `@carderne/sandbox-runtime` resolution); otherwise document “install separately” and skip dependency.

## 2. agent-pi security extensions (vendor)

- [ ] 2.1 Review [agent-pi](https://github.com/ruizrica/agent-pi) license; **pin a commit** and vendor **`extensions/security-guard.ts`**, **`extensions/lib/security-engine.ts`** (and any required **lib/** siblings), **`extensions/secure`** (or equivalent), **`extensions/message-integrity-guard`**, fixing import paths for devopet layout.
- [ ] 2.2 Register vendored extensions in `package.json` `pi.extensions` with **hook order** validated: integrity → guard → permission (exact order per smoke test); document in `design.md`.

## 3. Extension wiring (pi-connect + permissions)

- [ ] 3.1 Register **`pi-connect`** and `pi-permission-system` in `package.json` under `pi.extensions` with **validated load order** so **`/connect`** registers as a single unified flow; document final order in `design.md` or README.
- [ ] 3.2 If optional sandbox is bundled, register `pi-sandbox` with ordering documented (permissions vs sandbox vs guard—confirm no hook conflict).
- [ ] 3.3 Smoke-test: **`/connect`** picker, **`/disconnect`**, **`/security status`**, **`/secure`** (if non-destructive), blocked **`rm -rf`**-class command; then `node bin/devopet-agent.mjs --where`.

## 4. Defaults and documentation

- [ ] 4.1 Add example **`pi-permissions.jsonc`** and optional **`.pi/security-policy.yaml`** starter under `config/` or docs without overwriting user files on upgrade.
- [ ] 4.2 Update root `README.md` (security section): **permissions vs guard vs sandbox** matrix; **`/connect`** / pi-connect; **three-hook** model; **`/secure`**; **message-integrity-guard**; links to [security-guard.ts](https://github.com/ruizrica/agent-pi/blob/main/extensions/security-guard.ts) and [official pi providers](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/providers.md).
- [ ] 4.3 Document sandbox paths (`sandbox.json`, `.pi/sandbox.json`), `--no-sandbox`, and interaction with permission policy and security-guard.

## 5. Verification

- [ ] 5.1 Manual test: deny `write` in permission policy; test parse-error fallback.
- [ ] 5.2 Manual test: security-guard blocks a known-bad bash pattern; audit log entry appears when enabled.
- [ ] 5.3 Manual test: **`/connect`** with pi-connect + all security extensions loaded.
- [ ] 5.4 If sandbox bundled: bash wrap / denyWrite tests per prior scope.
- [ ] 5.5 Run `npm run check` (or project CI script) and fix regressions.
