## 1. Research

- [ ] 1.1 Inspect [ruizrica/agent-pi](https://github.com/ruizrica/agent-pi) for `mode-cycler`, mode names, and prompt templates; note reuse vs port.
- [ ] 1.2 Audit devopet/pi-tui for existing **Shift+Tab** or **Tab** chords; document conflicts.

## 2. Core implementation

- [ ] 2.1 Implement operational mode state machine (six modes + cycle order) in an extension or shared module.
- [ ] 2.2 Wire **Shift+Tab** to mode cycle; add optional settings key for alternate binding if conflicts found.
- [ ] 2.3 Implement per-mode system prompt injection hook (before_agent_start or equivalent).

## 3. Orchestration integration

- [ ] 3.1 When `multi-agent-orchestration` exists, connect **PIPELINE**, **TEAM**, **CHAIN** modes to their YAML/back-end entrypoints; otherwise implement prompt-only degradation with user-visible hint (footer or once-per-session message).

## 4. Persistence and UX

- [ ] 4.1 Persist last mode in settings if approved in design; default NORMAL.
- [ ] 4.2 Optional: show current mode in dashboard footer or status line.

## 5. Documentation and verification

- [ ] 5.1 Document mode table, Shift+Tab, cycle order, and relation to agent-pi in README or `docs/`.
- [ ] 5.2 Run `npm run check` if TypeScript changed; manual test: cycle all modes, verify PLAN/SPEC prompt tone, verify TEAM/CHAIN/PIPELINE hooks or degradation.
