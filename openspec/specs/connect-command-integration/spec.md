# Connect command integration (ai-provider-connect)

## Purpose

Provides **`/connect`**, **`/disconnect`**, and provider auth flows via first-party **`extensions/ai-provider-connect/`**, loading before **`security-engine`**. **[pi-connect](https://www.npmjs.com/package/pi-connect)** is a **behavioral reference**, not a mandatory npm dependency.

## Requirements

### Requirement: Unified `/connect` via devopet-owned extension

The system SHALL provide **`/connect`** and related provider authentication flows through a **first-party** extension under **`extensions/ai-provider-connect/`** (or successor path) registered in **`package.json` `pi.extensions`**. The **observable behavior** SHALL be **consistent with** **[pi-connect](https://www.npmjs.com/package/pi-connect)** documentation: unified picker, OAuth and API key flows for standard pi providers, unless this spec explicitly narrows scope (document any gaps).

#### Scenario: Open connect picker

- **WHEN** the user runs `/connect` with no arguments in an interactive session
- **THEN** a unified provider picker SHALL be available that supports OAuth and API key flows as in the pi-connect reference model

#### Scenario: Direct provider connect

- **WHEN** the user runs `/connect` with a provider identifier supported by the reference model (e.g. `/connect openai`)
- **THEN** the system SHALL initiate the corresponding connection flow with equivalent semantics to pi-connect

### Requirement: Disconnect command

The system SHALL expose **`/disconnect`** (or equivalent) so saved credentials can be removed per the same reference semantics; credential storage SHALL remain distinct from permission policy files unless explicitly documented otherwise.

#### Scenario: Disconnect flow

- **WHEN** the user runs `/disconnect` as documented for this extension
- **THEN** saved provider credentials SHALL be removable without conflicting with permission policy storage

### Requirement: Connection status semantics

Provider connection state presented in the connect UI SHALL distinguish **saved in auth store**, **available from environment**, and **not yet configured**, in line with the pi-connect reference UX model.

#### Scenario: User sees provider state

- **WHEN** the user opens the `/connect` picker
- **THEN** they SHALL be able to see which providers are connected, env-backed, or new

### Requirement: No competing connect command

The system SHALL NOT register a second, devopet-specific provider login command that duplicates **`/connect`** for the same official provider list; entry points SHALL remain **`/connect`** / **`/disconnect`** / **`/connect <provider>`** unless a deliberate rename is documented.

#### Scenario: Single connect entrypoint

- **WHEN** an operator looks for how to add API keys or OAuth for standard pi providers
- **THEN** documentation SHALL point to **`/connect`** for this extension’s behavior

### Requirement: Coexistence with permission enforcement

Permission policy enforcement SHALL operate alongside the connect extension without blocking legitimate **`/connect`** flows unless policy explicitly restricts related tools or special actions; any such restriction SHALL be documented.

#### Scenario: Connect while permissions enabled

- **WHEN** permission enforcement is loaded and the user runs `/connect`
- **THEN** the connect flow SHALL complete unless policy explicitly denies the underlying operations
