## ADDED Requirements

### Requirement: pi-connect bundled for unified `/connect`

The system SHALL include the **[pi-connect](https://www.npmjs.com/package/pi-connect)** extension so operators can use the **existing `/connect`** command as the unified surface for **OAuth** and **API key** provider login, consistent with upstream pi-connect behavior.

#### Scenario: Open connect picker

- **WHEN** the user runs `/connect` with no arguments in an interactive session
- **THEN** a unified provider picker SHALL be available that supports OAuth and API key flows as documented for pi-connect

#### Scenario: Direct provider connect

- **WHEN** the user runs `/connect` with a provider identifier supported by pi-connect (e.g. `/connect openai`)
- **THEN** the system SHALL initiate the corresponding connection flow per pi-connect semantics

### Requirement: Disconnect command

The system SHALL expose **`/disconnect`** (or the equivalent pi-connect command) so saved credentials can be removed per upstream pi-connect behavior.

#### Scenario: Disconnect flow

- **WHEN** the user runs `/disconnect` as documented for pi-connect
- **THEN** saved provider credentials SHALL be removable without conflicting with permission policy storage (policy files remain distinct from `auth.json` provider keys unless explicitly merged by upstream)

### Requirement: Connection status semantics

Provider connection state presented in the connect UI SHALL distinguish **saved in auth store**, **available from environment**, and **not yet configured**, in line with pi-connect’s documented status model.

#### Scenario: User sees provider state

- **WHEN** the user opens the `/connect` picker
- **THEN** they SHALL be able to see which providers are connected, env-backed, or new, per pi-connect’s intended UX

### Requirement: No competing connect command

The system SHALL NOT register a second, devopet-specific provider login command that duplicates **`/connect`** for the same pi official provider list; provider authentication entry points SHALL remain **`/connect`** / **`/disconnect`** / direct **`/connect <provider>`** as extended by pi-connect.

#### Scenario: Single connect entrypoint

- **WHEN** an operator looks for how to add API keys or OAuth for standard pi providers
- **THEN** documentation SHALL point to **`/connect`** (pi-connect) rather than a parallel command name

### Requirement: Coexistence with permission enforcement

Permission policy enforcement (pi-permission-system) SHALL operate alongside pi-connect without blocking legitimate **`/connect`** flows unless policy explicitly restricts related tools or special actions; any such restriction SHALL be documented.

#### Scenario: Connect while permissions enabled

- **WHEN** pi-permission-system is loaded and the user runs `/connect`
- **THEN** the connect flow SHALL complete unless policy explicitly denies the underlying operations

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
