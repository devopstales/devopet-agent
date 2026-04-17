## 1. Upstream and API discovery

- [ ] 1.1 Verify pi-mono / `@mariozechner/pi-coding-agent` hooks for system prompt assembly (or plan fork/extension injection point).
- [ ] 1.2 Document any upstream gaps versus `system-prompt-md-resolution` in `COMPAT.md` or design follow-up.

## 2. Path resolution

- [ ] 2.1 Implement helpers to resolve `.pi/SYSTEM.md`, `~/.pi/agent/SYSTEM.md`, and `APPEND_SYSTEM.md` pairs per spec order.
- [ ] 2.2 Implement helpers for `~/.devopet` and `.devopet` `SYSTEM.md` / `APPEND_SYSTEM.md` using existing devopet config root resolution.
- [ ] 2.3 Implement unified replace precedence and four-file append concatenation per `system-prompt-md-resolution`.

## 3. Bootstrap

- [ ] 3.1 Add shipped template for `~/.devopet/SYSTEM.md` with managed marker and hash guard (mirror `AGENTS.md` patterns in `extensions/defaults.ts`).
- [ ] 3.2 Wire bootstrap so `~/.devopet/SYSTEM.md` is created when missing on allowed startup paths without clobbering user files.

## 4. Settings merge

- [ ] 4.1 Load and merge `~/.devopet/settings.json` and `<project>/.devopet/settings.json` with pi settings using documented layer order in `devopet-settings-json-locations`.
- [ ] 4.2 Ensure relative paths in devopet `settings.json` resolve against `~/.devopet` or `<project>/.devopet` as appropriate.

## 5. Documentation and tests

- [ ] 5.1 Update `docs/devopet-config.md` (and README if needed) with precedence tables, links to [pi settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md), and `SYSTEM.md` / `APPEND_SYSTEM.md` behavior.
- [ ] 5.2 Add automated tests for path precedence, append order, settings merge, and bootstrap idempotency.
