## Context

- **[pi-rewind](https://github.com/arpagon/pi-rewind)** (MIT): Reference for **`/rewind`**, **Esc+Esc**, git checkpoint refs, footer status patterns. Upstream layout: `src/index.ts` (hooks), `src/ui.ts` (footer), `src/core.ts` (git).
- **devopet** **`extensions/dashboard/index.ts`** uses **`ctx.ui.setFooter`** with **`DashboardFooter`**—**one** active footer factory.

**Problem (unchanged):** Two extensions both fighting **`setFooter`** causes **one winner** or **flashing**. **Option B**: **merge** checkpoint UI into **`DashboardFooter`**.

**Policy:** Implement rewind **in devopet `ExtensionAPI` code**; **[pi-rewind](https://github.com/arpagon/pi-rewind)** informs **behavior, git ref layout, and tests**. A **thin loader** to **`node_modules/pi-rewind`** MAY exist **only during migration**—remove when in-tree passes specs.

## Goals / Non-Goals

**Goals:**

- **Observable parity** with reference docs: checkpoints, **`/rewind`**, redo, safe restore, **Esc+Esc** where applicable.
- **`◆ N checkpoints`** (or equivalent) **inside** dashboard footer HUD.
- **Single** `setFooter` registration.

**Non-Goals:**

- Treating **`pi-rewind`** **npm** as the **only** shipping path once first-party code lands.
- Pixel-identical footer to **standalone** upstream TUI—dashboard-integrated styling is OK.

## Decisions

1. **Implementation**  
   - **Choice**: **First-party** module(s) under **`extensions/`** (e.g. **`rewind/`** or **`checkpoint-rewind/`**) registering hooks and commands **per** specs.  
   - **Optional**: Temporary **dependency** on **`pi-rewind`** for parity spike—**not** long-term architecture.

2. **Footer merge strategy** (preference order)  
   - **A. Shared state bridge**: Rewind extension publishes **checkpoint count** via **`sharedState`** / **`dashboard:update`**; **`DashboardFooter`** renders it—**preferred**.  
   - **B. Patch `node_modules`**: **reject** unless emergency.  
   - **C. Thin bridge** that re-exports only UI glue: **only** if A is impossible without upstream API.

3. **Load order**  
   - **Choice**: Rewind extension loads **before** **dashboard** if needed so **`setFooter`** is **single**; **telemetry** updates footer **after** both load via **events/state**.

4. **Esc+Esc**  
   - **Choice**: Match reference behavior; document conflicts with **pi-tui** / dashboard.

5. **Git core**  
   - **Choice**: Implement **checkpoint git logic** **in-tree** **consistent with** reference **`core.ts`** semantics (refs paths, safety)—**not** “must import upstream `core.ts`” as permanent rule.

## Risks / Trade-offs

- **[Upstream API gap]** No exported checkpoint count → **Mitigation**: read **`refs/pi-checkpoints/`** or equivalent **documented** layout **matching** reference.
- **[Maintenance]** In-tree git logic → **Mitigation**: tests against fixtures; **COMPAT.md** reference version.

## Migration Plan

1. Land first-party extension + footer merge + docs.
2. Rollback: remove extension entry and dashboard diff.

## Open Questions

- Monolith **`extensions/rewind/`** vs **split** dashboard bridge module.
- Exact HUD string for narrow terminals.
