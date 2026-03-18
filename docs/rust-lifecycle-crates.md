---
id: rust-lifecycle-crates
title: Rust lifecycle crates — design-tree + openspec as native Rust modules
status: seed
parent: rust-phase-1
tags: [rust, lifecycle, design-tree, openspec, crates]
open_questions:
  - Keep markdown files as source of truth (matching TS behavior) or introduce lifecycle.db sqlite schema now? Markdown is simpler to migrate; sqlite is the long-term target per lifecycle-native-loop.
priority: 2
---

# Rust lifecycle crates — design-tree + openspec as native Rust modules

## Overview

Per the `lifecycle-native-loop` decision, design-tree and openspec are not feature crates — they're core lifecycle engine components. They live in the `omegon` crate's `lifecycle/` module (stubs already exist at `lifecycle/mod.rs`).

**design-tree → lifecycle/design.rs:**
- Markdown parsing + YAML frontmatter (serde_yaml + markdown parser)
- Node state machine: seed → exploring → resolved → decided → implemented (Rust enum with exhaustive match)
- File I/O: scan docs/ directory, read/write .md files with frontmatter
- Two tools: design_tree (query), design_tree_update (mutations)
- ContextProvider: inject focused node's overview + decisions + open questions
- Replaces: extensions/design-tree/ (4,630 LoC TS)

**openspec → lifecycle/spec.rs:**
- Spec parsing: Given/When/Then scenarios, requirements, falsifiability criteria
- Stage computation: proposed → specced → planned → implementing → verifying → archived
- Archive gating, reconciliation, lifecycle binding to design nodes
- One tool: openspec_manage (with sub-actions)
- ContextProvider: inject active change specs and tasks when bound to design node
- Replaces: extensions/openspec/ (4,132 LoC TS)

**Shared:** Both share lifecycle types (NodeStatus, ChangeStage) that live in the core. The `lifecycle-native-loop` decision noted they share `lifecycle.db` — but the immediate migration path is keeping markdown files as the source of truth (matching current TS behavior) rather than introducing a new sqlite schema.

## Open Questions

- Keep markdown files as source of truth (matching TS behavior) or introduce lifecycle.db sqlite schema now? Markdown is simpler to migrate; sqlite is the long-term target per lifecycle-native-loop.
