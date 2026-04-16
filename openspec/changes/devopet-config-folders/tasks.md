## 1. Path resolution module

- [ ] 1.1 Add a small shared module (e.g. `extensions/lib/devopet-config-paths.ts` or equivalent) exporting `getDevopetGlobalConfigDir()`, `findDevopetProjectConfigDir(cwd)`, and env override handling per design.
- [ ] 1.2 Add unit tests for upward walk, Windows vs Unix home, and env override behavior.

## 2. Integration surfaces

- [ ] 2.1 Extend `bin/devopet-agent.mjs` `--where` JSON (or adjacent debug output) to include `devopetConfigHome` and `devopetProjectConfigDir` when cheap to compute—update `tests/bin-where.test.ts` if assertions added.
- [ ] 2.2 Wire devopet-specific features (defaults extension, bootstrap, permissions/sandbox when present) to read/write under `~/.devopet` and `.devopet` per precedence; keep dual-read from legacy `~/.pi/agent` paths if needed for migration.
- [ ] 2.3 Document reserved subpaths (e.g. `permissions.jsonc`, `sandbox.json`) in README or `docs/` and add example `.devopet/.gitignore` snippet for repos.

## 3. Migration and verification

- [ ] 3.1 If dual-read is implemented, add a one-time migration note or optional script copying known files from `~/.pi/agent` to `~/.devopet` (non-destructive).
- [ ] 3.2 Run `npm run check` and fix regressions; manually verify `--where` and a config read from a fixture repo with `.devopet/`.
