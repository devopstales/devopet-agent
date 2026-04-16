## ADDED Requirements

### Requirement: DESIGN.md as UI contract

The system SHALL document **DESIGN.md** as the canonical **plain-text UI design contract** for application UI work, placed at the **project root** (or a single documented alternate path), aligned with **[Google Stitch DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview)** concepts (visual theme, palette, typography, components, layout, elevation, guardrails, responsive behavior, agent prompt guidance).

#### Scenario: Developer finds the convention

- **WHEN** an operator reads devopet documentation for UI planning
- **THEN** they SHALL find where to put **DESIGN.md** and a link to the Stitch overview

### Requirement: Reference templates

Documentation SHALL reference **[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** as a source of **ready-made DESIGN.md** templates and previews, without implying devopet endorses every third-party brand extract beyond MIT-curated use.

#### Scenario: Operator uses a template

- **WHEN** an operator copies a DESIGN.md from awesome-design-md into their project
- **THEN** devopet docs SHALL explain that agents should read it alongside **AGENTS.md** for consistent UI generation

### Requirement: AGENTS.md vs DESIGN.md

Documentation SHALL state the distinction: **AGENTS.md** describes **how to build** the project; **DESIGN.md** describes **how the UI should look and feel**, per the same split popularized by Stitch and awesome-design-md.

#### Scenario: Both files present

- **WHEN** both **AGENTS.md** and **DESIGN.md** exist in a repository
- **THEN** agent guidance SHALL prefer **DESIGN.md** for visual decisions and **AGENTS.md** for engineering conventions when scopes overlap

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
