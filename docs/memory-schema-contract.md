---
id: memory-schema-contract
title: Memory Schema Contract
status: decided
tags: [architecture, memory, cross-repo]
open_questions: []
---

# Memory Schema Contract

## Overview

Prevent schema drift between the Rust omegon-memory crate and the TS factstore by establishing a canonical schema contract that both repos validate against in CI.

## Research

### Option analysis

**Option A: Golden DB fixture (artifact-based)**
- Rust CI builds omegon-memory, creates a fresh DB, uploads as artifact
- TS CI cron downloads artifact, runs schema-compat tests against it
- Pro: Tests reality, not a description. No manual sync.
- Con: Requires cross-repo artifact plumbing. TS CI needs Rust build output. Coupling between CI systems.

**Option B: Schema contract JSON (declarative)**
- A `schema-contract.json` listing tables → required columns → types lives in one canonical location
- Both repos have a test: "does my schema produce at least these columns?"
- Pro: Simple, self-contained, readable. Each repo validates independently.
- Con: The contract itself can drift from reality if someone forgets to update it.

**Option C: Rust test generates contract, TS consumes (hybrid)**
- Rust has a test that creates a DB and exports its PRAGMA table_info as JSON → `schema-contract.json` in the Rust repo
- TS repo has a weekly cron that fetches raw `schema-contract.json` from the Rust repo's main branch and validates TS migration produces a superset
- Pro: Contract auto-generated from Rust (source of truth). TS validates against it without needing Rust build. Drift caught within a week max.
- Con: Cron delay (up to 1 week). But since both repos are by the same developer, the contract update and consumption happen in the same PR cadence.

**Option D: Shared npm package**
- Publish a `@styrene-lab/memory-schema` package from the Rust repo containing just the contract JSON
- TS depends on it and validates at test time
- Pro: Versioned, explicit dependency
- Con: Massive overhead for a single file. Not worth it.

**Recommendation: Option C** — Rust generates the contract from its actual schema, TS fetches and validates. The contract is always authoritative because it's derived from running code, not manually maintained.

## Decisions

### Decision: Rust generates schema contract, TS validates via cron

**Status:** decided
**Rationale:** Rust is the source of truth and should generate the contract from its actual running schema (not a hand-maintained file). A Rust test creates a fresh DB, dumps PRAGMA table_info for every table, and writes schema-contract.json. TS fetches it from the Rust repo's main branch on a weekly cron and validates that its migration produces a superset. This catches drift without cross-repo CI artifact plumbing. The contract file is also committed to the Rust repo so it's versioned and reviewable.

## Open Questions

*No open questions.*
