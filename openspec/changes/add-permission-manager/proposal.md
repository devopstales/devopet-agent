## Why

Operators need a **single, predictable permission story** in devopet: a **main policy file** in the same spirit as **[pi-permission-system](https://www.npmjs.com/package/pi-permission-system)** (`defaultPolicy`, per-tool/bash/MCP/skill rules, `allow` / `deny` / `ask`), plus **clear interactive elevation** when an action would be blocked—similar to **[pi-sandbox](https://www.npmjs.com/package/pi-sandbox)** (user can approve **for this attempt**, **for the session**, or persist allowances into config), instead of only silent failures or minimal UX. A **first-party `permission-manager` extension** keeps behavior **versioned with devopet**, documents load order relative to **`ai-provider-connect`** and **`security-engine`**, and avoids relying solely on external npm wiring for core safety UX.


### Security (devopet stack)

`extensions/security-engine` composes **integrity → guard → permissions → `/secure`** (see `extensions/security-engine/index.ts`). **`permission-manager`** (this change) becomes the **policy** row—replacing the current **`pi-permission-system`** npm load—while the other modules stay as today:

| Component | Role |
|-----------|------|
| **message-integrity-guard** | Prevents session-bricking from orphaned `tool_result` messages |
| **security-guard** | Pre-tool-hook: blocks destructive commands (e.g. `rm -rf`), `sudo`, credential theft, prompt injection |
| **permission-manager** | Policy-driven `allow` / `deny` / `ask` for tools, bash, MCP, skills, special via **`permissions.jsonc`**; interactive elevation (pi-sandbox–style prompts); **replaces** npm **pi-permission-system** per this change |
| **secure** | `/secure` — full AI security sweep + protection installer for any project |

**Footer**: Operators SHALL see these components reflected in the **session footer** (TUI status / dashboard HUD badges via **`ctx.ui.setStatus`** and **`footerData.getExtensionStatuses()`**—see spec). **`permission-manager`** SHALL always show whether the permission layer is **`YOLO`** (no config) or **policy** (config loaded).

**YOLO mode**: If **neither** `~/.devopet/permissions.jsonc` **nor** `.devopet/permissions.jsonc` exists, the permission layer runs in **YOLO mode**—no **`permissions.jsonc`** policy enforcement. **security-guard**, **message-integrity-guard**, and **`/secure`** are unchanged.

## What Changes

- Add a new in-repo extension **`extensions/permission-manager`** (registered in **`package.json` `pi.extensions`**) that implements permission policy loading, enforcement hooks, **footer-visible `YOLO` vs policy** status, and **pi-sandbox-like** confirmation flows for `ask` / blocked paths when a policy file exists.
- Define a **supported policy file** (primary: **`~/.devopet/permissions.jsonc`**, project: **`.devopet/permissions.jsonc`**, with local-over-global merge documented in design) aligned with **pi-permission-system** schema and semantics where practical (tools/bash/MCP/skills/special, wildcards, `allow` | `deny` | `ask`).
- Specify how **`permission-manager`** relates to the existing **`security-engine`** stack (which today loads **pi-permission-system** from `node_modules`): either **replace** upstream permission loading with `permission-manager`, or a **clear composition** (single enforcement path) so users are not double-gated or inconsistently prompted—decision recorded in **design.md**.
- Add **example config** under **`config/`** (e.g. **`config/permissions.example.jsonc`**) and tests covering policy parsing and hook behavior.
- **Clarify architecture**: **`ExtensionAPI` hooks** (e.g. `before_agent_start`, `tool_call`, and related surfaces) are **required** for unified allow/deny/ask—**OS-level sandboxing** (pi-sandbox-style bash wrapping) is **complementary** only: it does **not** replace hook-based enforcement for **in-process** agent tools (read/write/edit, MCP, skills, etc.). See **`specs/permission-manager/spec.md`** (“Extension hooks required; OS sandboxing is complementary”).
- **Non-goals for v1**: Bundling **full** OS-level sandboxing (bubblewrap / `sandbox-exec`) for bash as the primary permission mechanism—that remains optional or a separate extension; this change targets **hook-driven** policy + **pi-sandbox-inspired** interactive prompts. If OS sandbox is added later, it **must not** be documented as a substitute for the hook layer.

## Capabilities

### New Capabilities

- `permission-manager`: First-party extension for **pi-permission-system–style** JSONC policy, lifecycle hooks, **footer `YOLO`/`policy` indicator**, and **pi-sandbox-inspired** interactive allow/deny and persistent allow-list updates when a policy file exists.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`package.json`**: new `./extensions/permission-manager/...` entry; possible **reordering** next to **`ai-provider-connect`** and **`security-engine`**.
- **`extensions/security-engine`** and/or **`extensions/dashboard`**: footer/status wiring so the **security stack** and **`YOLO`/`policy`** are visible per spec.
- **`extensions/security-engine`**: may stop loading **`pi-permission-system`** from npm if **`permission-manager`** becomes the single enforcement layer—**dependency and bundle impact** per design.
- **User config**: **`~/.devopet/permissions.jsonc`** (global) and **`.devopet/permissions.jsonc`** (project); **no files** → **YOLO**; operators migrating from **`~/.pi/agent/pi-permissions.jsonc`** (upstream Pi) may copy the same JSONC into **`~/.devopet/permissions.jsonc`**.
- **Tests**: new or extended tests under **`tests/`** for policy + prompts + YOLO + footer/status; update any tests that assert extension list or security stack composition.
