## Why

Operators want **turn-based git checkpoints**, **`/rewind`**, **diff preview**, **redo stack**, and **safe restore** comparable to Claude Code / Cline / OpenCode. **[pi-rewind](https://github.com/arpagon/pi-rewind)** ([docs](https://arpagon.github.io/pi-rewind/)) is a **reference** Pi extension: **`/rewind`**, **Esc+Esc** quick rewind, git refs storage, footer-style **checkpoint status** (`◆ N checkpoints`).

devopet SHALL implement this capability as **first-party extension code** under **`extensions/`**, **aligned with** pi-rewind’s **documented behavior**—**not** by treating **`npm install pi-rewind`** as the defining architecture. **Option B** remains: merge **checkpoint indicator** into **`DashboardFooter`** so only **one** `setFooter` surface wins—consistent with existing dashboard design.

## What Changes

- **First-party extension(s)** implementing **checkpoint scheduling**, **`/rewind`**, **redo**, **safe restore**, and **Esc+Esc** semantics **consistent with** [pi-rewind](https://github.com/arpagon/pi-rewind) (reference)—git layout and hooks **per** delta specs.
- **Footer integration (option B)**: Extend **`extensions/dashboard/footer.ts`** (and/or **shared state**) so **checkpoint count / status** appears **inside** the **dashboard** HUD—**subscribe** to rewind extension state, **or** read the same **git refs / state** paths **documented** as equivalent to the reference.
- **Documentation**: **Esc+Esc**, **`/rewind`**, unified footer; **cleave “checkpoint”** vs pi-rewind-style checkpoints (disambiguation); link **pi-rewind** repo/docs as **reference**.
- **Non-goals for v1**: Obligating a **permanent** **`pi-rewind`** **npm** dependency; opaque fork of upstream **without** spec-driven parity tests.

## Capabilities

### New Capabilities

- `rewind-bundling`: First-party rewind/checkpoint extension; behavior SHALL match **`specs/rewind-bundling/spec.md`** (reference: pi-rewind).
- `checkpoint-footer-dashboard`: Checkpoint status in **dashboard** footer; **single** footer surface—**`specs/checkpoint-footer-dashboard/spec.md`**.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`package.json`**: extension entry for devopet-owned module(s); **optional** removal of **`pi-rewind`** from **`dependencies`** when in-tree implementation satisfies specs.
- **`extensions/dashboard/footer.ts`**, **shared-state** / types for checkpoint telemetry.
- **Risk**: **Esc+Esc** / footer merge bugs; **mitigate** with tests; **COMPAT.md** reference pins for regression comparison.
