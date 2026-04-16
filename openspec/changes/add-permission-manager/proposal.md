## Why

devopet inherits pi’s powerful tools (bash, file ops, MCP, skills) but does not yet ship a first-class **permission and sandbox story** in the default extension set. Operators need deterministic **allow / deny / ask** policy for tools and commands, optional **OS-level sandboxing** for subprocesses, and audit-friendly logging—similar to what the Pi ecosystem provides via [pi-permission-system](https://www.npmjs.com/package/pi-permission-system) (policy + UI gates) and [pi-sandbox](https://www.npmjs.com/package/pi-sandbox) (filesystem/network constraints and prompts). Adding this now aligns devopet with upstream pi security patterns and reduces “YOLO” risk for teams adopting the distribution.

**[agent-pi](https://github.com/ruizrica/agent-pi)** adds a **hardened security layer** that complements policy-based permissions: **pre-tool blocking** of destructive commands, **prompt-injection** handling, **data exfiltration** patterns, **credential theft** patterns, and **session integrity**—implemented as focused extensions with a **three-hook model** ([`security-guard.ts`](https://github.com/ruizrica/agent-pi/blob/main/extensions/security-guard.ts)). This change **extends** `add-permission-manager` to **bundle or vendor** those security capabilities alongside **pi-permission-system**, **pi-connect**, and optional **pi-sandbox**.

Operator **authentication** should stay on the **existing `/connect` surface**. **[pi-connect](https://www.npmjs.com/package/pi-connect)** provides unified OAuth/API key login—**one `/connect` command**—and remains the reference for extending **`/connect`**.

## What Changes

- Add **permission policy** support: global (and optionally per-agent) rules for tools, bash patterns, MCP targets, skills, and reserved “special” checks, with `allow` / `deny` / `ask` semantics and review logging where applicable.
- Integrate **permission enforcement** at Pi lifecycle hooks (`before_agent_start`, `tool_call`, relevant `input` paths) so disallowed capabilities are filtered or blocked before execution, not only by model behavior.
- Optionally integrate or document **sandbox-style** enforcement consistent with [pi-sandbox](https://www.npmjs.com/package/pi-sandbox).
- **Bundle [pi-connect](https://www.npmjs.com/package/pi-connect)** so **`/connect`** / **`/disconnect`** remain the canonical provider auth entry per [hk-vk/pi-connect](https://github.com/hk-vk/pi-connect).
- **Security hardening from [agent-pi](https://github.com/ruizrica/agent-pi)** (see [`extensions/security-guard.ts`](https://github.com/ruizrica/agent-pi/blob/main/extensions/security-guard.ts)):
  - **`security-guard`**: Pre-tool-hook **tool_call** gate blocks dangerous commands (**rm -rf**, **sudo**, etc.), **context** hook scans tool results for prompt injection / exfiltration patterns, **`before_agent_start`** injects system-prompt hardening; **`/security`** subcommands (e.g. status, log, policy, reload); optional **`.pi/security-policy.yaml`** tuning.
  - **`secure`**: **`/secure`** — full **AI security sweep** on a project and optional **portable protection installer** (per agent-pi behavior).
  - **`message-integrity-guard`**: Prevents **session-bricking** from **orphaned `tool_result`** messages.
- Declare **npm/git dependencies / extension wiring** for `pi-permission-system`, **`pi-connect`**, optional `pi-sandbox`, and **agent-pi security extensions** (vendored under `extensions/` from upstream or git submodule)—exact packaging in design.
- **Documentation**: policy files, **`/connect`**, **security layers** (how **permission policy** vs **security-guard** interact), **`/secure`**, audit logs (e.g. `.pi/security-audit.log` per security-guard source).

## Capabilities

### New Capabilities

- `permission-management`: *(unchanged scope)* Policy model, hooks, UX alignment with pi-connect where policy UI is shown.
- `sandbox-integration`: *(unchanged scope)* Optional pi-sandbox.
- `connect-command-integration`: *(unchanged scope)* pi-connect **`/connect`** surface.
- `security-guard-layer`: **Three-hook** defense from agent-pi **security-guard** — **tool_call** pre-execution gate, **context** content scanner, **`before_agent_start`** prompt hardening; **`/security`** command family; **`.pi/security-policy.yaml`**.
- `secure-sweep-command`: **`/secure`** comprehensive project security sweep and portable protections installer per agent-pi **secure** extension.
- `message-integrity-guard`: Integrity checks to prevent orphaned **`tool_result`** from bricking sessions.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **Extensions**: Additional **agent-pi**-derived modules (**security-engine** lib if separate), load order vs **pi-permission-system** (policy **ask** vs **guard block** ordering documented).
- **Dependencies**: Possible **git submodule** or **vendored copy** of agent-pi `extensions/` + `lib/security-engine`; license **Apache-2.0** / repo license—verify before vendoring.
- **User state**: `.pi/security-policy.yaml`, `.pi/security-audit.log`, plus existing `pi-permissions.jsonc`, `auth.json`.
- **Risk**: **False positives** on legitimate commands → **Mitigation**: tunable policy YAML, documented escape hatches. **Performance**: context scanning on large tool outputs—document limits.
