## Why

Operators want **turn-based git checkpoints**, **`/rewind`**, **diff preview**, **redo stack**, and **safe restore** comparable to Claude Code / Cline / OpenCode. **[pi-rewind](https://github.com/arpagon/pi-rewind)** ([docs site](https://arpagon.github.io/pi-rewind/)) provides this as a **Pi extension** with a dedicated **`/rewind`** command, **Esc+Esc** quick rewind, git refs storage, and a **footer status** line (`◆ N checkpoints`). devopet should **bundle** it with **pinned peers**, and—per **option B**—apply a **small devopet patch** so the checkpoint indicator **merges into the existing `DashboardFooter`** instead of fighting `setFooter` (only one footer component is active after dashboard registers).

## What Changes

- Add **`pi-rewind`** as an **`npm` dependency** and register it in **`package.json` `pi.extensions`** with version aligned to `@mariozechner/pi-coding-agent` / `pi-tui`.
- **Footer integration (option B)**: Extend **`extensions/dashboard/footer.ts`** (and/or shared state) so **checkpoint count / status** from pi-rewind appears inside **`DashboardFooter`** HUD cards or a dedicated strip—either by:
  - **Subscribing** to pi-rewind’s state/events if the extension exposes them, **or**
  - **Patching** a thin adapter in-repo that pi-rewind calls instead of replacing `setFooter`, **or**
  - **Reading** the same git refs / state file pi-rewind uses (documented in design).
- Document **Esc+Esc** and **`/rewind`**; note **cleave “checkpoint”** is unrelated (preflight commit vs rewind snapshot).
- **Non-goals for v1**: Forking all of pi-rewind into `extensions/`; changing pi-rewind’s core git logic (`core.ts`).

## Capabilities

### New Capabilities

- `rewind-bundling`: npm dependency (`pi-rewind`), manifest entry, smoke tests for `/rewind` and turn-end checkpointing.
- `checkpoint-footer-dashboard`: Checkpoint status visible in **dashboard** footer; no second competing footer registration.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`package.json`**: new dependency + extension path.
- **`extensions/dashboard/footer.ts`**, possibly **`shared-state`** or dashboard types for checkpoint telemetry.
- **Risk**: **Esc+Esc** / footer merge bugs; **peer drift** on pi upgrade—mitigate with tests and pinned versions.
