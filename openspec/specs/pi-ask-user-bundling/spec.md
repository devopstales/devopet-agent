# pi-ask-user bundling (first-party)

## Purpose

Provides the **`ask_user`** tool and related interactive UI through a first-party extension in **`extensions/`** (e.g. **`ask-user`** or **`ask-back`**). **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** is a **behavioral reference**, not a mandatory npm dependency.

## Requirements

### Requirement: ask_user via devopet-owned extension

The system SHALL provide the **`ask_user`** tool (and related interactive UI) through a **first-party** extension registered in **`package.json` `pi.extensions`**. **Observable behavior** SHALL be **consistent with** **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** documentation: searchable/split-pane UX, overlay mode where applicable, and invocability under normal pi tool policy unless this spec narrows scope (document gaps).

#### Scenario: Extension loads in session

- **WHEN** a devopet session starts with the extension enabled
- **THEN** the **`ask_user`** tool SHALL be registered and SHALL be invocable by the model within normal pi tool policy

#### Scenario: Install and peers

- **WHEN** the devopet package is installed and built
- **THEN** there SHALL be **no unrecoverable** peer conflicts for **`@mariozechner/pi-coding-agent`** / **`pi-tui`** attributable to this extension, or the change SHALL document required pi version alignment

### Requirement: Ask-user skill discoverability

The system SHALL document an **ask-user** skill (or equivalent) **consistent with** the reference **ask-user** skill for decision-gating workflows—whether **bundled under `skills/`**, shipped inside the extension, or linked—with a clear path for operators.

#### Scenario: Documentation references skill

- **WHEN** the operator reads devopet documentation for the ask-back module
- **THEN** they SHALL find how to use the **ask-user** skill pattern (handshake before high-impact choices)

### Requirement: Non-interactive fallback

When interactive UI is unavailable, behavior SHALL match the **reference model** for graceful fallback (no devopet-specific regression in v1 unless explicitly documented).

#### Scenario: Headless or constrained UI

- **WHEN** interactive TUI is not available for a prompt
- **THEN** fallback SHALL match **pi-ask-user**–documented semantics for that case
