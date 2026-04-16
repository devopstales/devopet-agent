## ADDED Requirements

### Requirement: pi-ask-user dependency and manifest registration

The system SHALL declare **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** as an **`npm` dependency** with a **pinned or semver-bounded** version compatible with devopet’s **`@mariozechner/pi-coding-agent`** and **`pi-tui`** peers, and SHALL register the extension in **`package.json` `pi.extensions`** using the correct path to the package entry after install.

#### Scenario: Install resolves and extension loads

- **WHEN** the operator runs **`npm install`** at the devopet package root
- **THEN** **`pi-ask-user`** SHALL install without unrecoverable peer conflicts or the change SHALL document required pi version alignment

#### Scenario: ask_user tool is available in session

- **WHEN** a devopet session starts with the extension enabled
- **THEN** the **`ask_user`** tool SHALL be registered per upstream behavior and SHALL be invocable by the model within normal pi tool policy

### Requirement: Bundled ask-user skill discoverability

The system SHALL document that **pi-ask-user** ships a bundled **ask-user** skill (upstream path under the package) for decision-gating workflows, and SHALL not strip or hide that skill when bundling.

#### Scenario: Documentation references skill

- **WHEN** the operator reads devopet documentation for the ask-back module
- **THEN** they SHALL find a pointer to the upstream **ask-user** skill and its intended use (handshake before high-impact choices)

### Requirement: Non-interactive fallback unchanged

The system SHALL rely on upstream **pi-ask-user** behavior for **graceful fallback** when interactive UI is unavailable; devopet SHALL not break that path in v1.

#### Scenario: Headless or constrained UI

- **WHEN** interactive TUI is not available for a prompt
- **THEN** behavior SHALL match upstream documented fallback (no devopet-specific regression in v1)

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
