## Why

devopet today follows upstream pi conventions and stores most mutable state under `~/.pi/agent` (via `PI_CODING_AGENT_DIR`). That is correct for pi compatibility but does not give operators a **clear, namespaced place for devopet-specific configuration** (permissions, sandbox, profiles, kit exports) separate from generic pi layout. Introducing **`~/.devopet` for user-level config** and **`.devopet` at the project root for repo-local config** makes policy and tooling paths predictable, documentable, and easy to back up or `.gitignore` appropriately—especially alongside extensions such as [pi-permission-system](https://www.npmjs.com/package/pi-permission-system) and [pi-sandbox](https://www.npmjs.com/package/pi-sandbox) that otherwise default to `~/.pi/agent`-relative paths.

## What Changes

- Define a **canonical global config root**: `~/.devopet/` (or `%USERPROFILE%\.devopet` on Windows), with a documented internal layout for devopet-owned files (exact filenames to align with design: e.g. permissions policy, sandbox JSON, profile metadata).
- Define a **project config root**: `<project>/.devopet/` for repository-scoped overrides (merge or override rules vs global, precedence documented).
- Wire the **runtime and extensions** so devopet reads/writes these paths for **configuration** (not necessarily every pi artifact—see design for what remains under `~/.pi/agent` vs migrates).
- **BREAKING** if the default agent state directory or env contract changes for existing users; mitigate with migration, env overrides, and release notes.
- Update **documentation** (README, security/permissions docs) to reference `~/.devopet` and `.devopet` instead of or in addition to `~/.pi/agent` paths for devopet-specific files.

## Capabilities

### New Capabilities

- `devopet-config-layout`: Resolution order for global vs project devopet config directories, environment variable overrides, merge semantics, and which subpaths are reserved for devopet.

### Modified Capabilities

- *(none in repository root `openspec/specs/` — no formal baseline specs yet.)*
- *Related change:* `openspec/changes/add-permission-manager/` specs reference `~/.pi/agent` for policy files; after this change, those requirements may need a follow-up delta to prefer `~/.devopet` when devopet owns policy paths.*

## Impact

- **`bin/devopet-agent.mjs`**, **`extensions/defaults.ts`**, bootstrap/update flows, and any code that assumes only `~/.pi/agent` for devopet-branded files.
- **User filesystem**: new directories; optional migration of existing config files.
- **Extensions** (permissions, sandbox, dashboard): path constants and docs.
- **Tests**: path assertions and fixtures under `tests/` and extension tests.
