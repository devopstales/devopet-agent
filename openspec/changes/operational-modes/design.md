## Context

- **[agent-pi](https://github.com/ruizrica/agent-pi)** describes **operational modes** and tooling such as **`mode-cycler`**; exact implementation may live in extension code upstream.
- **devopet** may implement modes **natively** in an extension, **vendor** agent-pi patterns, or **compose** with `multi-agent-orchestration` for TEAM/CHAIN/PIPELINE.

## Goals / Non-Goals

**Goals:**

- **Deterministic cycle order**: **NORMAL → PLAN → SPEC → PIPELINE → TEAM → CHAIN** → (wrap to NORMAL).
- **Shift+Tab** as primary chord; document **alternatives** if terminal or host steals the sequence.
- **Strong prompt separation** per mode so PLAN/SPEC constraints are visible to the model.

**Non-Goals:**

- Replacing the entire agent-pi repo; **reuse** where peers and license allow.
- Guaranteeing orchestration execution for TEAM/CHAIN/PIPELINE **before** `multi-agent-orchestration` ships—modes may **announce** intent via prompt until backends exist.

## Decisions

1. **Persistence**  
   - **Choice**: Persist **last mode** in `settings.json` or session state so restarts restore mode; **fallback** NORMAL if unset. **TBD** exact key name (`operationalMode`).

2. **PIPELINE vs TEAM order in UX**  
   - **Choice**: User specified order **… SPEC → PIPELINE → TEAM → CHAIN**; implement **exactly** unless pi-tui limitation forces remapping (document if so).

3. **Shift+Tab**  
   - **Choice**: Register at **pi-tui** / extension layer; **audit** conflicts with completion, focus cycling, or browser embed; offer **`devopet.modeCycleKey`** if needed.

4. **Orchestration coupling**  
   - **Choice**: **PIPELINE**, **TEAM**, **CHAIN** modes **SHALL** call into the same orchestration entrypoints as `multi-agent-orchestration` when available; **before** that, injected prompts **SHALL** still describe the intended workflow (degraded behavior).

5. **SPEC mode**  
   - **Choice**: Align prompt text with **OpenSpec** / SDD vocabulary already used in repo (`openspec/changes/*`) for consistency.

## Risks / Trade-offs

- [Keybinding conflict] Shift+Tab used elsewhere → **Mitigation**: configurable chord; doc terminal quirks.
- [Mode drift] User forgets current mode → **Mitigation**: visible indicator (footer/badge).
- [Partial implementation] Orchestration missing → **Mitigation**: clear “backend not loaded” messaging in docs or UI.

## Migration Plan

1. Ship modes + cycler + prompts; orchestration hooks stubbed or wired per dependency graph.
2. Release note: new keybinding and modes table.

## Open Questions

- Whether **agent-pi** exposes a **reusable npm package** for `mode-cycler` or only git install.
- Whether **NORMAL** should appear in cycle after CHAIN (wrap) — **yes** per proposal.
