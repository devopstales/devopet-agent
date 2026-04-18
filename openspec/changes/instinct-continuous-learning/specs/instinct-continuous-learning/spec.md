## ADDED Requirements

### Requirement: Devopet instinct artifacts

The system SHALL maintain **global** instinct documentation at **`~/.devopet/INSTINCT.md`** (or under `DEVOPET_CONFIG_HOME` when set) and SHALL support an optional **project** instinct file at **`<project>/.devopet/INSTINCT.md`**, using the same project root resolution as other devopet config (nearest `.devopet` walking upward from `cwd`, else `cwd/.devopet`).

#### Scenario: Operator locates instinct files

- **WHEN** an operator consults devopet documentation for continuous learning
- **THEN** they SHALL find the canonical paths for global and project `INSTINCT.md` and for the instinct observation subtree under `.devopet/`

### Requirement: Global skills directory

The system SHALL load discoverable skills from **`~/.devopet/skills/`** (when present) in addition to existing bundled and default skill paths, so graduated or hand-authored skills participate in session skill discovery without requiring a repo checkout.

#### Scenario: Skill file in global skills dir

- **WHEN** a valid skill file exists under `~/.devopet/skills/`
- **THEN** it SHALL be eligible for the same skill discovery mechanism used for packaged `skills/` (subject to existing pi skill parsing rules)

### Requirement: System prompt includes merged instincts

The composed system prompt SHALL incorporate non-empty **`INSTINCT.md`** content after existing **`APPEND_SYSTEM.md`** segments and before any final packaging steps, in order: **global `INSTINCT.md`**, then **project `INSTINCT.md`**, with a clear section heading that identifies the content as learned instincts.

#### Scenario: Instincts present

- **WHEN** at least one of global or project `INSTINCT.md` exists and contains non-whitespace content
- **THEN** the effective system prompt for the session SHALL include that content in the documented merge order

#### Scenario: No instincts

- **WHEN** both instinct files are missing or empty
- **THEN** the system SHALL NOT inject an instinct section and SHALL NOT fail session startup

### Requirement: Observation capture with scrubbing

The instinct extension SHALL append **scrubbed** session observations to a **project-scoped** append-only log under **`<project>/.devopet/instinct/`** (exact basename in implementation), dropping or redacting patterns consistent with devopet security expectations (API keys, bearer tokens, common secret formats).

#### Scenario: Secret-like substring in tool output

- **WHEN** an observation would record text matching configured secret patterns
- **THEN** the stored line SHALL redact or omit the sensitive material while preserving enough structure for downstream analysis

### Requirement: Non-blocking analysis

Any LLM-backed **distillation** or **refresh** of instincts from observations SHALL run **off the interactive critical path** (e.g. scheduled at session end or via explicit operator command) and SHALL NOT prevent the agent from accepting user input if analysis fails.

#### Scenario: Analyzer failure

- **WHEN** the analyzer subprocess or model call errors
- **THEN** the session SHALL remain usable and the extension SHALL surface a single best-effort notification or log line without crashing the runtime

### Requirement: Operator controls

The system SHALL expose at least one **slash command** (e.g. `/instinct`) with subcommands or arguments for **status**, **refresh**/analyze, and **enable/disable** (or equivalent documented mechanism), without requiring npm install of third-party CLIs.

#### Scenario: Operator requests refresh

- **WHEN** the operator invokes the refresh/analyze command
- **THEN** the system SHALL trigger the distillation pipeline according to design and SHALL leave `INSTINCT.md` unchanged if there is nothing new to merge

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
