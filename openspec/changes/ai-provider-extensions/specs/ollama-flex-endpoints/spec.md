## ADDED Requirements

### Requirement: pi-ollama extension is loaded

The system SHALL include the **@0xkobold/pi-ollama** extension so that enhanced Ollama model discovery and configuration apply to the devopet runtime.

#### Scenario: Extension present in manifest

- **WHEN** devopet starts with default extension configuration for this change
- **THEN** the @0xkobold/pi-ollama package SHALL be listed among loaded extensions per the project manifest

### Requirement: Local and custom Ollama base URL

The system SHALL support **local Ollama** and a **custom Ollama HTTP base URL** (non-localhost) through pi-ollama’s settings and environment variables, including precedence between global `~/.pi/agent/settings.json`, project `.pi/settings.json`, and `OLLAMA_HOST`.

#### Scenario: Remote Ollama host

- **WHEN** the user configures `ollama.baseUrl` or `OLLAMA_HOST` to point to a reachable non-local Ollama server
- **THEN** model listing and chat SHALL use that endpoint per pi-ollama behavior

### Requirement: Ollama Cloud endpoint correctness

The system SHALL route **Ollama Cloud** chat and discovery requests to the **HTTPS `/v1` API** (not the HTML homepage), consistent with pi-ollama’s documented fixes for `cloudUrl` and API key usage.

#### Scenario: Cloud chat uses v1

- **WHEN** Ollama Cloud is configured with `cloudUrl` and API key per pi-ollama
- **THEN** completion requests SHALL target the documented `/v1` chat-compatible path without trailing-slash duplication errors

### Requirement: Model metadata from api/show

The system SHALL use pi-ollama’s **`/api/show`** integration where applicable so that context length and capability badges reflect server-reported metadata for local and compatible endpoints.

#### Scenario: Context length displayed

- **WHEN** the user inspects Ollama model details via pi-ollama commands
- **THEN** context length and capability hints SHALL reflect `/api/show` data when the endpoint returns it

### Requirement: Documentation

User-facing documentation SHALL describe `ollama` settings keys, `OLLAMA_HOST`, `OLLAMA_HOST_CLOUD`, `OLLAMA_API_KEY`, and conflict-avoidance with pi-free’s Ollama Cloud catalog when both extensions are enabled.

#### Scenario: Operator configures Ollama

- **WHEN** an operator reads devopet documentation for Ollama
- **THEN** they SHALL find @0xkobold/pi-ollama referenced and configuration precedence explained

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
