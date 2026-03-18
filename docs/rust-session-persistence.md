---
id: rust-session-persistence
title: "Rust session persistence — save/load conversation state, session resume"
status: seed
parent: rust-phase-1
tags: [rust, session, persistence, resume]
open_questions: []
priority: 2
---

# Rust session persistence — save/load conversation state, session resume

## Overview

The Rust binary currently runs one-shot (cleave children). For interactive sessions, it needs:
- Save conversation state to disk on exit (JSON serialization of ConversationState + IntentDocument)
- Load and resume a previous session on startup
- Session listing and selection
- Episode generation on session end (via LLM bridge call)

Currently pi manages sessions in `~/.pi/agent/sessions/`. The Rust binary should read/write compatible formats or introduce its own session store.

## Open Questions

*No open questions.*
