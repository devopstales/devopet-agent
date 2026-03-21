# Memory Schema Contract — Design Spec (extracted)

> Auto-extracted from docs/memory-schema-contract.md at decide-time.

## Decisions

### Rust generates schema contract, TS validates via cron (decided)

Rust is the source of truth and should generate the contract from its actual running schema (not a hand-maintained file). A Rust test creates a fresh DB, dumps PRAGMA table_info for every table, and writes schema-contract.json. TS fetches it from the Rust repo's main branch on a weekly cron and validates that its migration produces a superset. This catches drift without cross-repo CI artifact plumbing. The contract file is also committed to the Rust repo so it's versioned and reviewable.

## Research Summary

### Option analysis

**Option A: Golden DB fixture (artifact-based)**
- Rust CI builds omegon-memory, creates a fresh DB, uploads as artifact
- TS CI cron downloads artifact, runs schema-compat tests against it
- Pro: Tests reality, not a description. No manual sync.
- Con: Requires cross-repo artifact plumbing. TS CI needs Rust build output. Coupling between CI systems.

**Option B: Schema contract JSON (declarative)**
- A `schema-contract.json` listing tables → required columns → types lives in one canonical locat…
