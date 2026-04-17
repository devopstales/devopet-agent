# Compatibility (`operational-modes`)

## Pi stack (required)

The operational-modes extension **MUST** run on devopet’s pinned **`@mariozechner/pi-coding-agent`**, **`pi-tui`**, and related packages.

## Reference implementation (behavioral baseline)

| Reference | Role | Notes |
|-----------|------|--------|
| [agent-pi](https://github.com/ruizrica/agent-pi) | Mode cycler UX, mode semantics, prompt patterns | Implement in **`extensions/`** per specs—not a required **npm** dependency |

Record a **reference commit or tag** when useful for regression comparison.
