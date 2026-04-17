# Compatibility (`rewind-integration`)

## Pi stack (required)

Rewind extensions **MUST** run on devopet’s pinned **`@mariozechner/pi-coding-agent`**, **`pi-tui`**, and related packages.

## Reference implementation (behavioral baseline)

| Reference | Role | Notes |
|-----------|------|--------|
| [pi-rewind](https://github.com/arpagon/pi-rewind) | `/rewind`, Esc+Esc, git checkpoints, footer patterns | Implement in **`extensions/`** per specs—not a required **npm** dependency long-term |

Record a **reference tag or commit** when useful for regression tests against **documented** git ref layout and UX.
