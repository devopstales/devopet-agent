## ADDED Requirements

### Requirement: nano-banana skill

The system SHALL make the **[nano-banana](https://github.com/ruizrica/agent-pi/tree/main/skills/nano-banana)** skill from **agent-pi** available to devopet sessions by **vendoring** it under the project `skills/` tree with correct attribution **or** by **documented install** commands that resolve to the same behavior, including **`SKILL.md`** and supporting scripts (`generate-image.js`, `inspect-response.js`, etc.) as upstream provides.

#### Scenario: Skill is discoverable

- **WHEN** devopet loads skills from `package.json` `pi.skills`
- **THEN** the nano-banana skill SHALL be loadable without manual path configuration beyond documented steps

### Requirement: Stitch design-md skill path

The system SHALL provide a **Stitch-aligned** skill or documentation path so agents are instructed to follow **[design-md](https://stitch.withgoogle.com/docs/design-md/overview)** workflows when planning or implementing UI; if no official npm skill exists, a **thin** `SKILL.md` in-repo MAY fulfill this by referencing Stitch docs and **DESIGN.md** placement rules.

#### Scenario: Agent follows design-md

- **WHEN** a user asks for UI planning using Stitch-style design-md
- **THEN** the integrated skill or docs SHALL steer the agent toward maintaining or creating **DESIGN.md** per Stitch structure

### Requirement: No silent API dependency

If **nano-banana** or related scripts require **API keys** or external services, documentation SHALL list required **environment variables** or configuration and SHALL NOT imply zero-setup where keys are mandatory.

#### Scenario: Missing credentials

- **WHEN** image or generation features are invoked without required keys
- **THEN** the user SHALL see a clear error or documented fallback per skill behavior

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
