# Security guard

The **security guard** is part of **`extensions/security-engine`** (`security-guard.ts`). It is **not** the same as [permission-manager](./permission-manager.md) (`permissions.jsonc`). Together they form two layers: the guard looks for **abuse patterns** (destructive shell, exfil, credential paths, prompt injection in content); permission-manager applies your **allow / deny / ask** policy for tools, bash, MCP, and skills.

**Load order:** `security-engine` loads **before** `permission-manager` so integrity and guard hooks run before permission checks on tool calls.

---

## What it does

- **`tool_call`** — Pre-execution checks on commands/paths (e.g. risky bash, sensitive paths).
- **`context`** — Scans tool output for prompt-injection style content (optional stripping per policy).
- **`before_agent_start`** — System prompt hardening / security reminders.

Threat categories include destructive commands, data exfiltration patterns, credential paths, prompt injection, and remote-exec style patterns. Implementation is derived from [agent-pi security-guard](https://github.com/ruizrica/agent-pi/blob/main/extensions/security-guard.ts) (vendored in this repo).

---

## Policy file (`security-policy.yaml`)

Rules are loaded from the **first file that exists** in this order:

1. **`<project>/.devopet/security-policy.yaml`** — nearest **`.devopet`** directory (walk upward from the current workspace / `projectRoot`).
2. **`~/.devopet/security-policy.yaml`** — global devopet config (honors **`DEVOPET_CONFIG_HOME`** like other devopet files; see [devopet-config.md](./devopet-config.md)).
3. **`<projectRoot>/.pi/security-policy.yaml`** — legacy project path.
4. **`~/.pi/agent/.pi/security-policy.yaml`** — legacy global path.

If **none** of these files exist, the guard uses a **built-in default** policy (still enforced).

The YAML shape includes tunable lists such as `blocked_commands`, `exfiltration_patterns`, `protected_paths`, `prompt_injection_patterns`, `allowlist`, and `settings` (enable/disable, audit log size, etc.). The parser is a small custom subset—see `extensions/security-engine/lib/security-engine.ts` (`parseSecurityYaml`, `loadPolicy`).

**Example:** `config/security-policy.example.yaml` in this repository (comments only by default).

---

## Precedence vs permission-manager

- **Permission policy** (`permissions.jsonc`) answers whether the user/agent **may** run a tool or command under your rules.
- **Security guard** can still **block** or **warn** when a pattern matches, even if permissions would **allow** the call—when safety requires it, **guard blocks win**.

Use **permissions** for workflow and consent; use **security-policy.yaml** for baseline safety tuning on top of defaults.

---

## Commands and logs

| Command | Purpose |
|---------|---------|
| `/security` | Subcommands such as **`status`**, **`log`**, **`policy`**, **`reload`** — inspect state, audit tail, show effective policy, reload YAML from disk. |

Audit log (default location under the project): **`.pi/security-audit.log`** (see guard implementation for rotation).

---

## Related pieces in `security-engine`

Same extension bundle, separate concerns:

| Piece | Role |
|-------|------|
| **Message integrity** | Repairs orphaned `tool_use` / `tool_result` pairs before API calls (automatic hook). |
| **`/secure`** | Project AI security sweep and optional installer-oriented flows (`secure.ts`) — not the same as editing `security-policy.yaml`. |

---

## See also

- [permission-manager.md](./permission-manager.md) — `permissions.jsonc`, `toolPaths`, `/yolo`  
- [devopet-config.md](./devopet-config.md) — `~/.devopet`, `.devopet/`, `DEVOPET_CONFIG_HOME`  
- [commands.md](./commands.md) — `/security` and other slash commands  
- `config/security-policy.example.yaml`  
