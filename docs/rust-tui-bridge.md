---
id: rust-tui-bridge
title: TUI bridge — Node.js subprocess receives AgentEvents and drives pi-tui terminal rendering
status: seed
parent: rust-phase-1
tags: [rust, tui, bridge, subprocess, rendering]
open_questions: []
priority: 1
---

# TUI bridge — Node.js subprocess receives AgentEvents and drives pi-tui terminal rendering

## Overview

A Node.js subprocess that imports pi-tui and pi-coding-agent's interactive mode, receiving AgentEvent stream from the Rust binary over a pipe (ndjson or msgpack). The TUI bridge translates Rust AgentEvents into pi-tui component updates — conversation rendering, tool call cards, dashboard, footer, editor input.

This is the transitional layer that lets Phase 1 ship with full TUI parity without rewriting the rendering layer. It's replaced by native Rust TUI in Phase 2.

**The bridge subprocess receives:**
- AgentEvent variants (turn_start, message_chunk, tool_start/end, etc.)
- Dashboard state updates (design-tree, openspec, cleave, memory)
- Prompt requests (when the agent loop needs user input)

**The bridge subprocess sends back:**
- User input (typed messages, steering)
- Slash command invocations
- Signal forwarding (Ctrl+C → cancel token)

**Key constraint:** The bridge must feel identical to current Omegon — same rendering, same keyboard shortcuts, same dashboard. Users should not notice the process inversion.

## Open Questions

*No open questions.*
