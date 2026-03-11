---
id: cleave-checkpoint-failure-clarity
title: Cleave checkpoint execution reliability and failure clarity
status: decided
parent: cleave-dirty-tree-checkpointing
tags: [cleave, git, checkpoint, workflow, ux]
open_questions:
  - After a confirmed checkpoint, should cleave automatically re-enter dirty-tree resolution for any remaining excluded files, or fail closed with an explicit post-checkpoint diagnosis and no generic blocker?
---

# Cleave checkpoint execution reliability and failure clarity

## Overview

Investigate the confirmed-checkpoint path in cleave so accepting a checkpoint reliably produces a clean worktree and continuation, or surfaces a precise failure cause instead of falling back to a generic dirty-tree blocker.

## Research

### Current post-checkpoint gap

runDirtyTreePreflight() returns "continue" immediately after checkpointRelatedChanges() succeeds, but cleave_run then calls ensureCleanWorktree(). If the checkpoint only staged related files and excluded unrelated/unknown files remain dirty, the operator sees a generic dirty-tree blocker after an apparently accepted checkpoint. The workflow lacks a post-checkpoint cleanliness verification step with precise diagnosis before leaving preflight.

## Decisions

### Decision: Checkpoint attempts must fail closed inside preflight with explicit post-checkpoint diagnosis

**Status:** decided
**Rationale:** A confirmed checkpoint is the operator trust boundary for cleave. If excluded files remain dirty or git commit fails, preflight must keep control and explain the exact reason instead of returning success and letting a later generic clean-worktree error appear.

## Open Questions

- After a confirmed checkpoint, should cleave automatically re-enter dirty-tree resolution for any remaining excluded files, or fail closed with an explicit post-checkpoint diagnosis and no generic blocker?
