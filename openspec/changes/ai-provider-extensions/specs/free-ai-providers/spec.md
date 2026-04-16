## ADDED Requirements

### Requirement: pi-free extension is loaded

The system SHALL include the **pi-free** Pi extension such that its registered providers and slash commands are available in the devopet runtime when no conflicting configuration disables it.

#### Scenario: Extension present in manifest

- **WHEN** devopet starts with default extension configuration for this change
- **THEN** the pi-free extension package SHALL be listed among loaded extensions per the project manifest

### Requirement: Qwen OAuth via pi-free

The system SHALL support **Qwen** models and OAuth device flow through pi-free’s documented commands (e.g. `/login qwen`, `/logout qwen`) without requiring devopet-specific forks of the OAuth implementation.

#### Scenario: User authenticates Qwen

- **WHEN** the user runs the documented Qwen login command from pi-free
- **THEN** the interactive OAuth flow SHALL complete per upstream behavior and Qwen-prefixed models SHALL become selectable when authorized

### Requirement: Kilo and NVIDIA providers

The system SHALL expose **Kilo** and **NVIDIA NIM** model families through pi-free’s provider registration, subject to user authentication and API keys documented for pi-free.

#### Scenario: NVIDIA key configured

- **WHEN** the operator sets a valid NVIDIA API key via `~/.pi/free.json` or documented environment variables
- **THEN** NVIDIA-registered models SHALL appear in the model selection surface per pi-free behavior

#### Scenario: Kilo OAuth

- **WHEN** the user runs the documented Kilo login command
- **THEN** Kilo OAuth SHALL complete per pi-free and additional Kilo models MAY become available per upstream rules

### Requirement: Ollama Cloud via pi-free catalog

The system SHALL allow access to **Ollama Cloud** free-tier models registered by pi-free when `ollama_api_key` and related pi-free settings are configured, without devopet blocking upstream registration.

#### Scenario: Ollama Cloud key set

- **WHEN** `ollama_api_key` is set in `~/.pi/free.json` or equivalent env vars per pi-free
- **THEN** Ollama Cloud models exposed by pi-free SHALL be selectable according to pi-free’s free vs paid toggle rules

### Requirement: Documentation

User-facing documentation SHALL reference pi-free for provider lists, `~/.pi/free.json` schema pointers, toggle commands, and links to the upstream repository for issue reporting.

#### Scenario: Operator finds setup steps

- **WHEN** an operator reads devopet documentation for additional free providers
- **THEN** they SHALL find pi-free named as the implementation and pointers to OAuth and API key setup

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
