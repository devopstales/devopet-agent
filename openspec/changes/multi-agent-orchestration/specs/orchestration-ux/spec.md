> **OpenSpec change:** `multi-agent-orchestration`.  
> **Implementation:** first-party extension(s) under **`extensions/`**. **[agent-pi](https://github.com/ruizrica/agent-pi)** UX patterns are **behavioral references**.

## ADDED Requirements

### Requirement: Agent team switcher command

The system SHALL expose **`/agents-team`** (or the exact spelling **consistent with** [agent-pi](https://github.com/ruizrica/agent-pi) if different) so the user can **switch between configured agent teams** without editing config files manually for every switch.

#### Scenario: User switches team

- **WHEN** multiple teams are defined in `teams.yaml` and the user runs the team switcher command
- **THEN** they SHALL be able to select a team and subsequent orchestration SHALL use that team’s agent list

### Requirement: Theme cycling keybinding

The system SHALL support **Ctrl+X** to **cycle through installed themes** when that binding does not conflict with existing pi-tui or devopet defaults; if a conflict exists, the system SHALL document an alternative binding or configuration key.

#### Scenario: Theme changes on cycle

- **WHEN** the user presses the configured theme-cycle chord and multiple themes are installed
- **THEN** the active theme SHALL advance to the next theme in the cycle per documented ordering

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
