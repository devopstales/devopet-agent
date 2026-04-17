# Compatibility (`multi-agent-orchestration`)

## Pi stack (required)

Orchestration extensions **MUST** run on devopet’s pinned **`@mariozechner/pi-coding-agent`**, **`pi-tui`**, and related packages without unrecoverable peer issues.

## Reference implementations (behavioral baselines)

These projects **inform** YAML layout, dispatch patterns, and messenger UX. **This change does not require** shipping them as **npm/git runtime dependencies** once first-party code satisfies the delta specs.

| Reference | Role | Notes |
|-----------|------|--------|
| [agent-pi](https://github.com/ruizrica/agent-pi) | Teams, chains, pipelines, widgets, toolkit MD | Implement in **`extensions/`** per specs |
| [pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm) | Channels, tasks, `/messenger` overlay | Optional feature; reference semantics |

Record a **reference commit or tag** when useful for regression comparison; update when intentionally following upstream changes.
