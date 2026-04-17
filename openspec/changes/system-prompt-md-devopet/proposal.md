## Why

Upstream **[pi-mono coding-agent](https://github.com/badlogic/pi-mono)** (and related docs such as [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md)) is moving toward **Markdown-owned system prompt** content: operators want **`SYSTEM.md`** to **replace** the built-in default system prompt (project vs global resolution), and **`APPEND_SYSTEM.md`** to **add** instructions **without** replacing the default. devopet already distinguishes **pi core state** (`~/.pi/agent`, `.pi/`) from **devopet product config** (`~/.devopet`, `.devopet/`) per `devopet-config-folders`; system-prompt files and **settings.json** locations should follow that split so devopet users do not have to duplicate policy under `.pi` for devopet-owned layout.

## What Changes

- **Pi-aligned resolution (in devopet builds)**: When using **pi-relative** paths, support **`SYSTEM.md`** as full **replacement** of the default system prompt, resolved as **project** `.pi/SYSTEM.md` with fallback to **global** `~/.pi/agent/SYSTEM.md` (exact precedence and “file missing” behavior per design).
- **Append path**: Support **`APPEND_SYSTEM.md`** (project and global analogs) so additional system instructions are **merged in** without discarding the default prompt (unless design explicitly composes replace + append in a defined order).
- **devopet paths**: Mirror the same **replace / append** semantics using **`~/.devopet/SYSTEM.md`**, **`<project>/.devopet/SYSTEM.md`**, and **`APPEND_SYSTEM.md`** under those trees—**not** under `.devopet` for pi’s `settings.json` arrays if upstream only reads `.pi/`; instead document **where devopet writes** and how resolution **prefers** `.devopet` when both exist (see design).
- **Bootstrap**: On first run (or when devopet ensures global config), **create** a starter **`~/.devopet/SYSTEM.md`** if absent (non-destructive template), analogous to how global `AGENTS.md` is deployed—without overwriting user edits.
- **Settings file locations for devopet**: Document and implement (where technically required) **`settings.json`** (and related resource paths from [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md)) living under **`~/.devopet/`** and **`.devopet/`** project roots, with merge order consistent with pi (project overrides global) and with existing **`DEVOPET_CONFIG_HOME`** / project `.devopet` discovery.
- **Documentation**: User-facing docs for path matrix (pi vs devopet), bootstrap behavior, and interaction with **`AGENTS.md`** (orthogonal; system prompt vs project context files).

## Capabilities

### New Capabilities

- `system-prompt-md-resolution`: Replace vs append semantics, filename rules (`SYSTEM.md`, `APPEND_SYSTEM.md`), global vs project resolution for both **pi-relative** and **devopet-relative** roots, and composition order (append after base prompt unless specified otherwise).
- `devopet-system-md-bootstrap`: Ensure **`~/.devopet/SYSTEM.md`** exists at session/bootstrap when appropriate; marker or hash guard pattern consistent with `AGENTS.md` deployment; never clobber user-authored content.
- `devopet-settings-json-locations`: Where **`settings.json`** (and path-relative entries like `extensions`, `skills`, `prompts`, `themes`) resolve under **`~/.devopet`** / **`.devopet`**, aligned with pi’s [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) merge semantics.

### Modified Capabilities

- `devopet-config-layout`: Delta may be needed so **precedence** and **reserved names** explicitly include **`SYSTEM.md`**, **`APPEND_SYSTEM.md`**, and **`settings.json`** under devopet roots (implementation may sync main spec in a follow-up).

## Impact

- **Upstream alignment**: Implementation may depend on **pi-mono** / `@mariozechner/pi-coding-agent` APIs for system prompt injection; may require **vendored fork** or **extension hooks** if core does not yet expose file-based replace/append.
- **`extensions/defaults.ts`**, bootstrap, and path helpers (`devopet-config-paths` or equivalent).
- **Documentation**: `docs/devopet-config.md`, README, possibly `CONTRIBUTING.md`.
- **Tests**: Path resolution, merge order, bootstrap idempotency, no double-replace.
