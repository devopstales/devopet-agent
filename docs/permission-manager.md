# Permission manager

The **permission-manager** extension (`extensions/permission-manager`) is devopet’s policy layer for **tools**, **bash**, **MCP**, **skills**, and **special** hooks. It uses the same JSONC shape as [pi-permission-system](https://www.npmjs.com/package/pi-permission-system), but reads and merges configuration from devopet paths and adds devopet-specific behavior (path-scoped rules, YOLO toggle, effective policy file).

**Load order:** It runs after **`ai-provider-connect`** and **`security-engine`** so integrity and guard hooks execute before permission checks on tool calls (`package.json` → `pi.extensions`).

**Relationship to the security guard:** Permission-manager only handles **`permissions.jsonc`** (allow/deny/ask, `toolPaths`, YOLO). The **bash security guard** and its **`security-policy.yaml`** are documented in **[security-guard.md](./security-guard.md)**. The guard can still block unsafe patterns even when policy would allow—see that doc for precedence. OS-level sandboxing (e.g. pi-sandbox) is separate; in-process tools are gated by policy + guard here.

---

## Configuration files

| Location | Role |
|----------|------|
| **`~/.devopet/permissions.jsonc`** | Global policy (user-wide). |
| **`<project>/.devopet/permissions.jsonc`** | Project overlay; merged **on top of** global for the current workspace. |
| **`~/.devopet/permissions.effective.jsonc`** | **Merged effective policy** written at resolution time. The bundled `PermissionManager` points at this file so a single JSON document reflects global + project (+ defaults). |

If **neither** global nor project permission files exist, devopet uses a built-in **default-ask** policy (everything `ask`). That is **not** YOLO.

On startup, if **`permissions.effective.jsonc`** is missing, the extension seeds it with the same default-ask baseline so the path always exists.

Global root override follows other devopet config: see [devopet-config.md](./devopet-config.md) (`DEVOPET_CONFIG_HOME`, project `.devopet/` discovery).

---

## JSONC schema (summary)

The root object is compatible with upstream pi-permission-system, plus optional devopet fields.

- **`defaultPolicy`** — Required in stored files (parser fills defaults if omitted). Fields: `tools`, `bash`, `mcp`, `skills`, `special`; each is `allow` \| `deny` \| `ask`.
- **`tools`**, **`bash`**, **`mcp`**, **`skills`**, **`special`** — Maps of pattern or name → `allow` \| `deny` \| `ask` (see upstream docs for bash/MCP pattern style).
- **`yolo`** (optional, boolean) — If **`true`**, the permission layer treats policy as bypassed for enforcement (explicit opt-in). **Missing or `false`** means normal enforcement. There is no “YOLO by omission”: absent config files still mean **ask**, not YOLO.
- **`toolPaths`** (optional, devopet) — Per-tool path globs for built-in **`read`**, **`write`**, and **`edit`**. Keys are glob patterns (same `*` semantics as upstream wildcard matching); values are `allow` \| `deny` \| `ask`. Project entries override global for the same tool + pattern key when merged.

Example fragment:

```jsonc
{
  "defaultPolicy": {
    "tools": "ask",
    "bash": "ask",
    "mcp": "ask",
    "skills": "ask",
    "special": "ask"
  },
  "tools": { "write": "ask" },
  "bash": {},
  "mcp": {},
  "skills": {},
  "special": {},
  "toolPaths": {
    "write": {
      "/tmp/*.txt": "allow"
    }
  }
}
```

A full commented example lives at **`config/permissions.example.jsonc`** in this repo.

---

## Merge semantics

- **Global** and **project** files are merged for the current working directory.
- **Project** maps override **global** where the same keys apply (including `defaultPolicy` fields and entries inside `tools` / `bash` / … / `toolPaths`).
- The result is written to **`~/.devopet/permissions.effective.jsonc`** and used as the single config path for the permission runtime.

After editing JSONC by hand, start a **new session** or run **`/reload`** so hooks reload policy.

---

## Interactive prompts (ask)

When policy returns **ask**, the UI offers choices. For **path-based** built-in tools (`read`, `write`, `edit`) with a resolvable file path, the prompt includes:

- The **absolute path** involved.
- A suggested **glob** used when persisting rules (for example `/tmp/test.txt` → `/tmp/*.txt`; extensionless paths use a directory-wide `*` pattern).

**Menu options:**

| Option | Effect |
|--------|--------|
| **Allow once** | Permits this call only. |
| **Allow for this session** | Caches approval for this tool + path (and related gate key) until the session ends. |
| **Allow for this repository** | Appends an **`allow`** rule under **`toolPaths`** in **`.devopet/permissions.jsonc`** (project), then refreshes merged policy. |
| **Allow globally** | Same, but writes **`~/.devopet/permissions.jsonc`**. |
| **Abort** | Denies the call. |

Path rules are evaluated **before** the generic tool-level check: a matching **`allow`** on the path can approve without re-prompting; **`deny`** blocks.

Non-path tools (and flows without a UI) keep the narrower set of choices (e.g. subagents may not get repository/global persistence).

---

## Slash command: `/yolo`

Registered by this extension for quick inspection and toggling of the **`yolo`** flag in **global** `~/.devopet/permissions.jsonc` only (not the project file).

| Subcommand | Behavior |
|------------|----------|
| `/yolo` | Short usage (tab-complete subcommands like `/auth`). |
| `/yolo status` | Shows global and project file presence, parsed `yolo` when present, and **effective** merged result for the current workspace. |
| `/yolo enable` | Sets **`yolo: true`** on the global file (creates file with default-ask shape if needed). |
| `/yolo disable` | Sets **`yolo: false`** on the global file (no-op if the file is missing). |

After **`enable`** / **`disable`**, run **`/reload`** or start a new session so the extension reapplies policy.

See also: [commands.md](./commands.md) (Security and permissions).

---

## Status line (dashboard)

The footer may show a short label for this extension, for example **`ask-default`** when using the built-in ask-everything default, **`policy`** when a real file drives defaults, **`YOLO`** when `yolo: true`, or **`ERR`** when policy failed to parse (with a fallback to safe defaults where applicable).

---

## Implementation notes

- **Vendor core:** `vendor/pi-permission-extension.ts` adapts upstream permission-system behavior to devopet paths and devopet-only features (path prompts, `toolPaths`, YOLO integration).
- **Policy merge and I/O:** `policy.ts` (parse/merge/effective file, `appendToolPathRule` for persisted path allows).
- **Path helpers:** `tool-path-policy.ts` (resolution, glob suggestion, matching).
- **Command:** `yolo-command.ts` (`/yolo`).

---

## See also

- [security-guard.md](./security-guard.md) — YAML policy, `/security`, precedence vs permissions  
- [devopet-config.md](./devopet-config.md) — `~/.devopet` and `.devopet/` layout  
- [commands.md](./commands.md) — Slash commands including `/yolo`  
- `config/permissions.example.jsonc` — Copy/paste starter policy  
