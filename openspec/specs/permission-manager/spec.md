# Permission manager

## Purpose

First-party **`extensions/permission-manager/`** implementing pi-permission-system–compatible **`permissions.jsonc`** policy with **`security-engine`** integration (single enforcement path), hooks-based gating, footer visibility, and YOLO when no config exists.

## Requirements

### Requirement: Policy file location and precedence

The system SHALL load permission policy from a JSONC document at the **global** devopet path **`~/.devopet/permissions.jsonc`** when present.

The system SHALL support an optional **project-local** policy file at **`.devopet/permissions.jsonc`** (relative to the project root) that **overrides** global entries where both define the same rule key, with precedence **local over global** for conflicting keys.

**YOLO mode**: When **neither** the global file nor the project-local file exists, the system SHALL operate in **YOLO mode** for the **permission layer** only: **`permission-manager` SHALL NOT** enforce **`permissions.jsonc`** permission rules (`allow` / `deny` / `ask`; same schema as upstream **pi-permission-system**). **message-integrity-guard**, **security-guard**, and **`/secure`** behavior in **`security-engine`** remain active and are **not** disabled by YOLO.

#### Scenario: Global-only policy

- **WHEN** only `~/.devopet/permissions.jsonc` exists
- **THEN** the effective policy SHALL be derived entirely from that file after validation

#### Scenario: Local overrides global

- **WHEN** both global and project-local policy files exist and define the same rule key
- **THEN** the project-local value SHALL win for that key

#### Scenario: YOLO when no permission config

- **WHEN** neither `~/.devopet/permissions.jsonc` nor `.devopet/permissions.jsonc` exists
- **THEN** the permission layer SHALL be in **YOLO mode** (no permission-policy enforcement) and other **security-engine** components SHALL continue to run unchanged

#### Scenario: Project-local-only policy

- **WHEN** only `.devopet/permissions.jsonc` exists and there is no `~/.devopet/permissions.jsonc`
- **THEN** the effective policy SHALL be derived from the project-local file after validation

### Requirement: Invalid or unreadable policy file

When a policy file **exists** but is **invalid JSONC**, **fails schema validation**, or is **unreadable** (permissions / I/O error), the system SHALL **fail loading** with an error that identifies the **file path** and **reason**. The system SHALL **NOT** silently fall back to **YOLO** when the operator created a config file that fails to load.

#### Scenario: Parse error does not imply YOLO

- **WHEN** `~/.devopet/permissions.jsonc` or `.devopet/permissions.jsonc` exists but is not valid JSONC (or fails validation)
- **THEN** loading SHALL fail with a clear error and the permission layer SHALL NOT be treated as YOLO

### Requirement: Policy schema compatibility

The policy document SHALL express **default** modes and per-category rules using the same **top-level structure** as **[pi-permission-system](https://www.npmjs.com/package/pi-permission-system)**: `defaultPolicy` with `tools`, `bash`, `mcp`, `skills`, and `special`; and optional maps `tools`, `bash`, `mcp`, `skills`, `special` for specific rules.

Each permission decision SHALL be one of `allow`, `deny`, or `ask`.

#### Scenario: Invalid permission token rejected

- **WHEN** the policy contains a permission value that is not `allow`, `deny`, or `ask`
- **THEN** loading SHALL fail with a clear error that identifies the offending key

### Requirement: Lifecycle enforcement hooks

The `permission-manager` extension SHALL register Pi extension hooks sufficient to enforce policy for **tool invocations** and **bash** (and MCP/skills/special where exposed by `@mariozechner/pi-coding-agent` in this repo’s integration) consistent with the loaded policy.

#### Scenario: Tool call gated by policy

- **WHEN** a tool call is made, a policy file is loaded, and the effective policy for that tool is `deny`
- **THEN** the call SHALL NOT execute

#### Scenario: YOLO does not apply deny from missing file

- **WHEN** the permission layer is in **YOLO mode** (no config files)
- **THEN** `permission-manager` SHALL NOT block tool calls solely because a `deny` rule would apply if a policy file existed

#### Scenario: Bash gated by policy

- **WHEN** a bash command is requested, a policy file is loaded, and the effective policy for that command pattern is `deny`
- **THEN** the command SHALL NOT execute

### Requirement: Tool and prompt surfaces when policy loaded (pi-permission-system parity)

When a valid policy file is loaded, the extension SHALL use **`before_agent_start`** (or equivalent Pi **`ExtensionAPI`** hooks) to **hide or filter** tools and related system surfaces so that **denied** tools are not presented to the model **where the API supports it**, consistent with **[pi-permission-system](https://www.npmjs.com/package/pi-permission-system)** documented behavior (tool filtering and system-prompt sanitization).

#### Scenario: Denied tool not offered when hooks support it

- **WHEN** a tool is classified as `deny` under the loaded policy and Pi exposes a hook to adjust the active tool list before the agent starts
- **THEN** that tool SHALL NOT remain in the set the model may invoke (best-effort if the API is partial)

### Requirement: security-engine integration

`extensions/security-engine` SHALL integrate **`permission-manager`** as the **sole** devopet permission-layer implementation for **`permissions.jsonc`** policy (pi-permission-system–compatible schema): it SHALL **NOT** load **`pi-permission-system`** from **`node_modules`** in a way that registers a **second** permission enforcement path for the same session.

#### Scenario: Single permission enforcement path

- **WHEN** `security-engine` loads with this change applied
- **THEN** at most one permission-layer implementation SHALL register hooks that enforce permission policy for tools/bash/MCP/skills/special for that session

### Requirement: Extension hooks required; OS sandboxing is complementary

The system SHALL enforce **pi-permission-system–style** policy using **`ExtensionAPI` hooks** (or equivalent event subscriptions exposed by `@mariozechner/pi-coding-agent`), including but not limited to surfaces needed for **`before_agent_start`**-style filtering, **`tool_call`** gating, bash classification, and MCP/skills/special handling as required elsewhere in this spec.

**OS-level sandboxing** (e.g. **[pi-sandbox](https://www.npmjs.com/package/pi-sandbox)**-style `sandbox-exec` or bubblewrap around **bash** subprocesses) SHALL NOT replace those hooks for **in-process** work: agent tools that run inside the Node process (including typical read/write/edit paths) are **not** isolated by a subprocess sandbox and MUST be gated via extension hooks.

Where OS sandboxing is used, it SHALL be **complementary** (e.g. additional isolation for shell subprocesses), not the sole mechanism for unified allow/deny/ask across tools, bash, MCP, skills, and special operations.

#### Scenario: In-process tools use hooks, not sandbox alone

- **WHEN** a tool runs in the agent’s Node process
- **THEN** allow/deny/ask SHALL be applied through registered extension hooks so policy holds regardless of whether bash OS sandboxing is enabled

#### Scenario: Optional bash sandbox does not remove hook enforcement

- **WHEN** bash is additionally wrapped by an OS-level sandbox
- **THEN** the extension SHALL still evaluate **`permissions.jsonc`** for bash (patterns, ask/deny) when loaded and run interactive elevation via hooks/prompts as specified; OS sandbox SHALL NOT be documented as a substitute for that policy layer

### Requirement: Interactive elevation (pi-sandbox-inspired)

When a **valid policy file is loaded** and an action would be blocked by policy or is classified as `ask`, the system SHALL prompt the user with at least: **abort**, **allow for this attempt**, and **allow for the remainder of the session** for the same gate class (exact wording MAY match Pi UI conventions). In **YOLO mode**, this requirement does not apply to permission-policy **`ask`** (see scenarios above).

The system MAY offer **persist allow rule** when safe and consistent with policy grammar (e.g. add/adjust an allow pattern).

#### Scenario: Ask policy shows prompt

- **WHEN** a valid policy file is loaded and the effective policy for an action is `ask`
- **THEN** the user SHALL be prompted before the action proceeds

#### Scenario: Allow proceeds without permission prompt

- **WHEN** a valid policy file is loaded and the effective policy for an action is `allow`
- **THEN** the action SHALL proceed without an interactive permission prompt from `permission-manager`

#### Scenario: YOLO does not trigger permission-manager ask prompts

- **WHEN** the permission layer is in **YOLO mode**
- **THEN** `permission-manager` SHALL NOT show interactive prompts that would only apply if a permission-policy **`ask`** rule existed

#### Scenario: Session allow remembers for session

- **WHEN** the user chooses session-scoped allow for a gated action
- **THEN** subsequent matching actions in the same session SHALL NOT re-prompt for the same gate unless the session scope is cleared

### Requirement: Footer visibility of security stack

When the session has a UI (`ctx.hasUI`), the change SHALL surface the **Security (devopet stack)** components in the **footer** area operators already use (Pi **`ctx.ui.setStatus`** and the **dashboard** HUD line that reads **`footerData.getExtensionStatuses()`** in **`extensions/dashboard/footer.ts`**).

At minimum, **`permission-manager`** SHALL call **`ctx.ui.setStatus("permission-manager", …)`** (or the same mechanism other extensions use for footer text) so the status string includes **`YOLO`** when no permission config is loaded, and a clear **policy** indicator when a config is active.

The change SHALL also ensure **message-integrity-guard**, **security-guard**, and **secure** are represented in that footer/status strip—either via **`security-engine`** publishing additional **`setStatus`** keys (e.g. short **`ok`** / **`active`** labels) or a **single aggregated** status line that lists **integrity · guard · perms · secure**, consistent with the table in **`proposal.md`**.

#### Scenario: YOLO visible in footer

- **WHEN** the session UI is available and no permission config file exists
- **THEN** footer-visible status SHALL include **`YOLO`** (or an equally unambiguous label) for the permission layer

#### Scenario: Policy visible in footer

- **WHEN** the session UI is available and a valid permission policy file is loaded
- **THEN** footer-visible status SHALL indicate that **policy** is active (not YOLO)

#### Scenario: Stack components discoverable in footer

- **WHEN** the session UI is available
- **THEN** the operator SHALL be able to read footer/status text that reflects the **integrity · guard · permissions · secure** stack (exact formatting MAY be compact glyphs or abbreviations)

### Requirement: Extension packaging

The `permission-manager` SHALL be implemented under `extensions/permission-manager/` and registered in `package.json` `pi.extensions` such that load order remains compatible with **`ai-provider-connect`** loading before the security stack and **`permission-manager`** integrating with **`security-engine`** without duplicate permission enforcement.

#### Scenario: Registered in devopet

- **WHEN** the devopet `package.json` is inspected
- **THEN** it SHALL list the `permission-manager` extension path under `pi.extensions`

### Requirement: Tests and example config

The change SHALL include `config/permissions.example.jsonc` (or an updated example) reflecting the supported schema.

The change SHALL include automated tests that cover policy parsing and at least one enforcement path (e.g. denied tool or `ask` → prompt decision).

#### Scenario: Example validates

- **WHEN** a maintainer copies `config/permissions.example.jsonc` to `~/.devopet/permissions.jsonc`
- **THEN** the agent SHALL start without policy parse errors (assuming no conflicting local files)

#### Scenario: Footer or status is test-covered

- **WHEN** automated tests run for this change
- **THEN** they SHALL cover **YOLO** vs **policy** visibility (e.g. `setStatus` payload or exported helper) in addition to parsing and at least one enforcement path
