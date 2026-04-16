## Context

- **[pi-rewind](https://github.com/arpagon/pi-rewind)** (MIT): `src/index.ts` wires Pi events; `src/ui.ts` (~33 LOC) handles **footer status**; `src/core.ts` is git-only. Install: `pi install npm:pi-rewind` per [README](https://github.com/arpagon/pi-rewind).
- **devopet** **`extensions/dashboard/index.ts`** calls **`ctx.ui.setFooter(...)`** once and returns **`DashboardFooter`**, which **replaces** the default pi footer entirely.

**Problem:** If pi-rewind also registers footer updates via `setFooter` or internal TUI APIs, **only one** wins—or they **overwrite** each other. **Option B** explicitly merges checkpoint UI into **`DashboardFooter`** rather than stacking two footers.

## Goals / Non-Goals

**Goals:**

- Ship **pi-rewind** behavior (checkpoints, `/rewind`, redo, safe restore) **bundled**.
- Show **`◆ N checkpoints`** (or equivalent) **inside** dashboard footer HUD.
- Avoid duplicate **setFooter** factories.

**Non-Goals:**

- Reimplement pi-rewind **core** git logic in devopet.
- Guarantee pixel-identical footer to stock pi-rewind standalone.

## Decisions

1. **Bundling**  
   - **Choice**: **`pi-rewind`** in `dependencies` with semver pin; path `node_modules/pi-rewind/...` in `pi.extensions` (exact export path after `npm install`).

2. **Footer merge strategy** (pick one during implementation; ordered by preference)  
   - **A. Shared state bridge**: pi-rewind (or a **tiny wrapper extension** loaded after pi-rewind) writes **checkpoint count** to **`sharedState`** / `dashboard:update` event; **`DashboardFooter`** reads it—**no fork** of pi-rewind if upstream adds a hook.  
   - **B. Patch `node_modules`**: fragile—reject unless emergency.  
   - **C. Fork `ui.ts` only** in `extensions/pi-rewind-ui-bridge/` that imports pi-rewind internals—only if A is impossible.

3. **Load order**  
   - **Choice**: **`pi-rewind`** loads **before** **dashboard** so dashboard’s `setFooter` wins; **bridge** extension or **shared state** updates footer content from pi-rewind state **after** both load.

4. **Esc+Esc**  
   - **Choice**: Verify no conflict with pi-tui; document override if needed.

## Risks / Trade-offs

- [Upstream API] pi-rewind may not export checkpoint count → **Mitigation**: read **git refs** under `refs/pi-checkpoints/` or file pi-rewind documents—**spike** in task 1.
- [Maintenance] Bridge code on pi-rewind bumps → **Mitigation**: pin version; changelog watch.

## Migration Plan

1. Add dep + extension; land footer merge; document.
2. Rollback: remove dep and dashboard diff.

## Open Questions

- Does pi-rewind expose **checkpoint count** via **ExtensionContext**, **events**, or **only** internal `ui.ts`?
- Exact string: **`◆ X checkpoints`** per [site](https://arpagon.github.io/pi-rewind/) — match or shorten for narrow terminals.
