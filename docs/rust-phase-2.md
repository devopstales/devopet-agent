---
id: rust-phase-2
title: "Phase 2 — Native TUI: Dioxus/ratatui replaces pi-tui bridge subprocess"
status: seed
parent: rust-agent-loop
tags: [rust, phase-2, tui, dioxus, ratatui]
open_questions: []
---

# Phase 2 — Native TUI: Dioxus/ratatui replaces pi-tui bridge subprocess

## Overview

The TUI bridge subprocess disappears. The Rust binary drives the terminal directly via Dioxus terminal renderer or ratatui/crossterm. Dashboard, splash, spinner, tool card rendering — all native Rust. The Node.js LLM bridge is the only remaining subprocess. ~5.7k LoC of TypeScript rendering code migrates to Rust.

## Open Questions

*No open questions.*
