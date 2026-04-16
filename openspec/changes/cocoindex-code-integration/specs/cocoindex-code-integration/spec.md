## ADDED Requirements

### Requirement: MCP server registration

The system SHALL document and, where technically appropriate, supply configuration so that **cocoindex-code** can run as a **stdio MCP server** compatible with devopet’s MCP bridge, using the upstream-documented invocation (e.g. `ccc mcp`) and exposing the **`search`** tool contract.

#### Scenario: Stdio server configuration

- **WHEN** an operator follows devopet documentation to enable cocoindex-code
- **THEN** they SHALL be able to configure a MCP stdio server entry with `command` and `args` matching upstream cocoindex-code MCP instructions

### Requirement: Prerequisites documented

User-facing documentation SHALL state that **cocoindex-code** is installed separately (e.g. via `pipx` or `uv`), that the **`ccc`** CLI must be available on `PATH`, and SHALL summarize the difference between **`cocoindex-code[full]`** (local embeddings) and the **slim** install (cloud embeddings / API keys).

#### Scenario: Operator installs prerequisites

- **WHEN** a new user reads the devopet cocoindex-code section
- **THEN** they SHALL find install commands and a note verifying `ccc` is reachable before enabling MCP

### Requirement: Configuration precedence

Any bundled example MCP configuration for cocoindex-code SHALL follow the **mcp-bridge merge order** (project `mcp.json` overrides user overrides extension defaults) and SHALL NOT silently override operator-defined server names without documentation.

#### Scenario: Project overrides global

- **WHEN** the same server id is defined in `.pi/mcp.json` and a bundled fallback
- **THEN** the project definition SHALL win per existing bridge rules

### Requirement: Optional skills documentation

Documentation SHALL reference the upstream **Agent Skill** installation path (`npx skills add cocoindex-io/cocoindex-code`) as an optional complement to MCP, without implying it is required for devopet core operation.

#### Scenario: User chooses skill-based workflow

- **WHEN** an operator prefers skills over MCP
- **THEN** they SHALL find a pointer to the official cocoindex-code skill install flow

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
