# devopet configuration directories

devopet uses two path layers for product-specific configuration, separate from pi core state (`auth.json`, `settings.json`, `sessions/`, …) under **`PI_CODING_AGENT_DIR`** (default **`~/.pi/agent`**).

## Global: `~/.devopet`

- Default: **`~/.devopet`** (on Windows: **`%USERPROFILE%\.devopet`**).
- Override: set **`DEVOPET_CONFIG_HOME`** to an absolute path, or **`~`** / **`~/…`**, for containers and tests.
- The defaults extension and bootstrap ensure this directory exists early when devopet runs.

## Project: `.devopet/`

- Resolved by walking **from the current working directory upward** until a directory named **`.devopet`** is found, or the filesystem root is reached.
- Precedence for future merged config: **project `.devopet` overrides or merges with `~/.devopet`** (exact rules per file type when those features land).

## Debugging

`devopet --where` (and the `pi` compatibility shim) prints JSON including:

- **`devopetConfigHome`** — resolved global devopet config root
- **`devopetProjectConfigDir`** — absolute path to the nearest `.devopet` directory, or `null`

## Reserved names (conventions)

These filenames are reserved for devopet-managed or coordinated configuration. Prefer placing them under **`~/.devopet`** / **`.devopet`** rather than overloading **`~/.pi/agent`** when the feature is devopet-specific.

| Location | Examples (conventions) |
|----------|-------------------------|
| Global | `permissions.jsonc`, `sandbox.json`, operator profiles not owned by upstream pi |
| Project | Same basenames under `.devopet/` with local override semantics |

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
