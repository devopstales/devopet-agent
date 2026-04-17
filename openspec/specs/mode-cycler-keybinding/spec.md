# Mode cycler and keybinding

## Purpose

Fixed mode cycle order and **Shift+Tab** as the primary chord for cycling modes. **[agent-pi](https://github.com/ruizrica/agent-pi)** mode-cycler patterns are a **behavioral reference**, not a mandatory package import.

## Requirements

### Requirement: Mode cycle order

The system SHALL cycle operational modes in this **fixed order**: **NORMAL → PLAN → SPEC → PIPELINE → TEAM → CHAIN → NORMAL** (wrapping).

#### Scenario: Forward cycle

- **WHEN** the user invokes the mode-cycle action from **NORMAL**
- **THEN** the next mode SHALL be **PLAN**

#### Scenario: Wrap from last mode

- **WHEN** the user invokes the mode-cycle action from **CHAIN**
- **THEN** the next mode SHALL be **NORMAL**

### Requirement: Shift+Tab binding

The system SHALL bind **Shift+Tab** to **mode cycling** as the **primary** chord documented for operators, unless a documented platform conflict requires a different default.

#### Scenario: User cycles with Shift+Tab

- **WHEN** the user presses **Shift+Tab** in an interactive TUI session
- **THEN** the operational mode SHALL advance one step in the cycle order

### Requirement: Mode cycler behavior (first-party)

The implementation SHALL provide **centralized, testable** mode switching **consistent with** [agent-pi](https://github.com/ruizrica/agent-pi) **mode-cycler** semantics, implemented **in devopet extension code**—not by requiring an upstream **`mode-cycler`** package as the integration surface.

#### Scenario: Repeated cycles are stable

- **WHEN** the user presses the mode-cycle chord six times from **NORMAL**
- **THEN** the mode SHALL return to **NORMAL** after completing one full cycle
