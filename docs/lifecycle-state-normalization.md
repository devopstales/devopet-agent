---
id: lifecycle-state-normalization
title: Lifecycle state normalization
status: implementing
parent: repo-consolidation-hardening
tags: [lifecycle, design-tree, openspec, dashboard, shared-state]
open_questions: []
branches: ["feature/lifecycle-state-normalization"]
openspec_change: lifecycle-state-normalization
---

# Lifecycle state normalization

## Overview

Define the next repo-consolidation-hardening slice that reduces duplicated lifecycle truth across design-tree, OpenSpec, dashboard, and memory by introducing a more canonical resolver/publication seam.

## Research

### Why this should be the next slice

The parent consolidation topic identified duplicated lifecycle truth as a top opportunity: design-tree, OpenSpec, dashboard, and memory each publish overlapping state with partially separate derivations. After subprocess hardening, this is the next highest-leverage slice because it improves correctness and internal coherence without requiring an immediate full decomposition of every large extension entrypoint.

### Likely implementation seam

The most practical seam is not a repo-wide rewrite of all state handling at once. Instead, introduce a canonical lifecycle snapshot/resolver module that design-tree, OpenSpec, and dashboard can consume for shared status concepts such as change stage, verification substate, design binding, task completion, and current assessment freshness. Existing extensions can then publish or render from that shared resolver incrementally.

## Decisions

### Decision: Make lifecycle normalization the next repo-consolidation-hardening slice

**Status:** decided
**Rationale:** It directly addresses a top architectural duplication identified in the repo assessment, improves lifecycle correctness across multiple extensions, and is more bounded than attempting broad extension decomposition or model-control consolidation next.

### Decision: Start with a canonical lifecycle resolver, not a full rewrite

**Status:** decided
**Rationale:** A shared resolver for lifecycle state can be adopted incrementally by dashboard, OpenSpec, and design-tree with lower risk than trying to centralize all mutable state immediately. This keeps the slice specable and testable.

## Open Questions

*No open questions.*
