# devopet configuration directories

devopet uses two path layers for product-specific configuration, separate from pi core state (`auth.json`, `settings.json`, `sessions/`, …) under **`PI_CODING_AGENT_DIR`** (default **`~/.pi/agent`**).

## Global: `~/.devopet`

- Default: **`~/.devopet`** (on Windows: **`%USERPROFILE%\.devopet`**).
- Override: set **`DEVOPET_CONFIG_HOME`** to an absolute path, or **`~`** / **`~/…`**, for containers and tests.
- The defaults extension and bootstrap ensure this directory exists early when devopet runs.

## Project: `.devopet/`

- Resolved by walking **from the current working directory upward** until a directory named **`.devopet`** is found, or the filesystem root is reached.
- Precedence for merged JSON settings: **`~/.pi/agent/settings.json`** → **`<cwd>/.pi/settings.json`** → **`~/.devopet/settings.json`** → **`<project>/.devopet/settings.json`** (later layers win per key; nested objects merge like [pi settings](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md)). Helpers: `extensions/lib/devopet-settings-merge.ts`.

## `SYSTEM.md` and `APPEND_SYSTEM.md` (system prompt)

The extension builds a **merged system prompt**: packaged **`config/SYSTEM.md`** is the baseline (**layer 0**), then layers **1–5** concatenate in order; **`APPEND_SYSTEM.md`** files append **after** that base in the order shown in the second column.

| Layer | Merged replace stack (`SYSTEM.md` + `AGENTS.md`) | Append (`APPEND_SYSTEM.md`) — concatenation order |
|--------|--------------------------------------------------|---------------------------------------------------|
| 0 | `config/SYSTEM.md` (packaged) | *Merge with all layers below* |
| 0 |  | `~/.devopet/INSTINCT.md` |
| 1 (highest) | `<project>/.devopet/SYSTEM.md` | `~/.pi/agent/APPEND_SYSTEM.md` |
| 2 | `~/.devopet/SYSTEM.md` | `<ancestor>/.pi/APPEND_SYSTEM.md` |
| 3 | `<ancestor>/.pi/SYSTEM.md` | `~/.devopet/APPEND_SYSTEM.md` |
| 4 | `~/.pi/agent/SYSTEM.md` | `<project>/.devopet/APPEND_SYSTEM.md` |
| 5 | `<project>/AGENTS.md` | — |

- **Layer 0** is always the shipped **`config/SYSTEM.md`** when present; layers **1–5** are concatenated after it (skip missing or empty files).
- **Ancestor `.pi/`** is the nearest **`.pi`** directory walking **up** from `cwd` (not only `cwd/.pi`).
- **`APPEND_SYSTEM.md`** segments apply after the merged replace text, in column order; missing files are skipped.
- Implementation: `extensions/system-prompt-md/index.ts` (`before_agent_start`), `extensions/lib/system-prompt-md.ts`.

### Bootstrap: `~/.devopet/SYSTEM.md`

On startup, the defaults extension ensures **`~/.devopet/SYSTEM.md`** exists with a short starter body and **`<!-- managed by devopet -->`**, plus a hash file **`.system-md-hash`** for non-destructive updates (same pattern as global **`AGENTS.md`**).

## Debugging

`devopet --where` (and the `pi` compatibility shim) prints JSON including:

- **`devopetConfigHome`** — resolved global devopet config root
- **`devopetProjectConfigDir`** — absolute path to the nearest `.devopet` directory, or `null`

## Reserved names (conventions)

These filenames are reserved for devopet-managed or coordinated configuration. Prefer placing them under **`~/.devopet`** / **`.devopet`** rather than overloading **`~/.pi/agent`** when the feature is devopet-specific.

| Location | Examples (conventions) |
|----------|-------------------------|
| Global | **`settings.json`** (merged with pi per layer order above), **`SYSTEM.md`**, **`APPEND_SYSTEM.md`**, **`permissions.jsonc`** (permission policy, pi-permission-system–compatible), **`security-policy.yaml`** (security guard rules), `sandbox.json`, operator profiles not owned by upstream pi |
| Project | Same basenames under **`.devopet/`** (e.g. **`settings.json`**, **`SYSTEM.md`**, **`permissions.jsonc`**, **`security-policy.yaml`**) with local override semantics; security guard loads **project `.devopet` first**, then **`~/.devopet`**, then legacy **`.pi/security-policy.yaml`**. **Project memory** (SQLite + `facts.jsonl`) lives under **`.devopet/memory/`**; the append-only session log is **`.devopet/memory/.session_log`** (see [project-memory.md](./project-memory.md)). |

Relative paths in **`settings.json`** arrays (**`extensions`**, **`skills`**, **`prompts`**, **`themes`**, **`packages`**) resolve against **`~/.devopet`** or **`<project>/.devopet`** (`resolveDevopetSettingsPathArrays` in `extensions/lib/devopet-settings-merge.ts`). Field semantics: [pi-mono settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md).

Details: [permission-manager.md](./permission-manager.md) (`permissions.jsonc`, merge, `toolPaths`, YOLO); [security-guard.md](./security-guard.md) (`security-policy.yaml`, `/security`, guard vs permissions).

Upstream pi and extensions may continue to document paths under **`~/.pi/agent`** until adapters read the devopet locations.

## Repositories: ignoring local `.devopet`

Commit project defaults you want shared; keep machine-specific or secret-bearing files out of git:

```gitignore
# Optional: ignore all project-local devopet overlay
/.devopet/

# Or ignore only sensitive patterns inside it
/.devopet/secrets.json
/.devopet/*.local.json
```

## Migration from `~/.pi/agent` (optional, non-destructive)

v1 keeps pi core state in **`~/.pi/agent`**. To copy selected files into the devopet tree **without deleting** the originals (adjust paths to taste):

```sh
mkdir -p ~/.devopet
# Example only — copy if you maintain devopet-only policy files alongside pi:
# cp ~/.pi/agent/pi-permissions.jsonc ~/.devopet/permissions.jsonc 2>/dev/null || true
```

Run **`devopet --where`** after changes to confirm **`devopetConfigHome`**.
