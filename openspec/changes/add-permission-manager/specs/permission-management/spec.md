## ADDED Requirements

### Requirement: Coordination with security-guard

Permission policy (**pi-permission-system**) and **[agent-pi security-guard](https://github.com/ruizrica/agent-pi/blob/main/extensions/security-guard.ts)** serve different roles: **policy** expresses operator **allow/deny/ask**; **guard** applies **baseline hard blocks** and **content scanning**. Documentation SHALL explain **precedence** when both apply (typically **guard block** overrides **allow** for the same invocation when safety requires—exact rules per `design.md`).

#### Scenario: Guard blocks despite permissive policy mistake

- **WHEN** a tool call matches a security-guard block rule (e.g. known-destructive pattern)
- **THEN** the call SHALL be blocked even if a misconfigured permission file would otherwise allow it, unless upstream explicitly supports disabling that guard category

### Requirement: UX alignment with pi-connect

Permission-related user interfaces (allow/deny/ask prompts, optional configuration modals) SHOULD follow the same **interaction style** as **[pi-connect](https://www.npmjs.com/package/pi-connect)** for **`/connect`**: clear lists, OAuth vs API key modes where applicable, and readable status—so permission management **feels like** the existing connect experience rather than a unrelated UI paradigm.

#### Scenario: Policy prompt clarity

- **WHEN** the permission extension prompts the user for an `ask` decision
- **THEN** the prompt SHALL be presentable in the TUI without duplicating `/connect` provider login (which remains owned by pi-connect)

### Requirement: Permission policy file

The system SHALL support a global permission policy file at `~/.pi/agent/pi-permissions.jsonc` (or the directory implied by `PI_CODING_AGENT_DIR` when set) containing `defaultPolicy`, and optional sections for `tools`, `bash`, `mcp`, `skills`, and `special`, using permission states `allow`, `deny`, and `ask` per upstream pi-permission-system semantics.

#### Scenario: Valid policy loads

- **WHEN** the policy file exists, is valid JSONC (no trailing commas where unsupported), and the permission extension is loaded
- **THEN** the active merged policy SHALL be applied to tool visibility, tool execution gating, and configured categories without silently falling back to unrestricted behavior unless documented as the explicit fallback for parse failure

#### Scenario: Parse failure is safe

- **WHEN** the policy file is missing or cannot be parsed
- **THEN** the extension SHALL fall back to a documented safe default (e.g. `ask` for all categories) and SHALL NOT treat missing policy as full allow for dangerous categories

### Requirement: Lifecycle enforcement

The system SHALL integrate with Pi lifecycle hooks so that denied or unregistered tools cannot be invoked, and `ask` decisions require user confirmation when UI is available, consistent with pi-permission-system behavior.

#### Scenario: Before agent start filters tools

- **WHEN** a session starts and `before_agent_start` runs
- **THEN** tools disallowed by policy SHALL be removed from the active tool set and the system prompt SHALL not advertise tools the agent cannot use

#### Scenario: Tool call enforcement

- **WHEN** the agent issues a tool call covered by policy
- **THEN** the call SHALL be allowed, denied, or prompted per the resolved permission state and registered tool name rules

### Requirement: Per-agent overrides

The system SHALL support per-agent permission overrides via YAML frontmatter in agent definitions when upstream pi-permission-system provides this mechanism, with shallower-merge semantics per section as documented upstream.

#### Scenario: Agent override merges global policy

- **WHEN** an agent file includes `permission:` frontmatter
- **THEN** merged permissions for that agent SHALL override the global file for matching keys without discarding unspecified global rules

### Requirement: Audit logging

The system SHALL support optional file-based permission review logging under the extension’s directory when enabled in extension config, without writing sensitive prompts to the terminal by default.

#### Scenario: Review log append

- **WHEN** a permission is denied or an `ask` prompt is shown and review logging is enabled
- **THEN** a structured append-only log entry SHALL be written to the configured review log path

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
