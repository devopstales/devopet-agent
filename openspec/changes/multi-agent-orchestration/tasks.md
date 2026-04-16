## 1. Upstream evaluation

- [ ] 1.1 Clone [ruizrica/agent-pi](https://github.com/ruizrica/agent-pi); confirm build, `package.json` entry point, peer deps, and whether npm publish exists or git install only.
- [ ] 1.2 Map modules (**agent-team**, **agent-chain**, **pipeline-team**, **subagent-widget**, **toolkit-commands**) to files and verify YAML examples (`teams.yaml`, `agent-chain.yaml`, `pipeline-team.yaml`) match user-provided samples.

## 2. Dependency and manifest

- [ ] 2.1 Add agent-pi (or split packages if upstream structure requires) to `package.json` with pin; register in `pi.extensions` with load order tested against cleave/bootstrap.
- [ ] 2.2 Run `npm install`; fix peer warnings against `@mariozechner/pi-coding-agent` / `pi-tui`.

## 3. UX and keybindings

- [ ] 3.1 Verify **`/agents-team`** registration; smoke-test team switching with a sample `agents/` tree in `examples/`.
- [ ] 3.2 Audit **Ctrl+X** against current pi-tui keymaps; resolve conflicts or add configurable theme-cycle binding per design.

## 4. Documentation

- [ ] 4.1 Add README section: multi-agent orchestration, link to agent-pi, `agents/` layout, chains (`$INPUT` / `$ORIGINAL`), pipeline phases, subagent widgets, toolkit Markdown.
- [ ] 4.2 Document relationship to **cleave** (when to use teams vs cleave children).

## 5. Verification

- [ ] 5.1 Run `npm run check` if TypeScript touched; add or extend tests for YAML validation if implemented in-repo.
- [ ] 5.2 Manual smoke: one team dispatch, one chain run, optional pipeline; confirm subagent widget visibility if applicable.

## 6. pi-messenger-swarm (optional messaging)

- [ ] 6.1 Evaluate **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** (peer deps, `pi-tui` / `@mariozechner/pi-coding-agent` alignment, bundle size); decide **bundled dependency + `pi.extensions`** vs **documented `pi install npm:pi-messenger-swarm` only** per design decision 6.
- [ ] 6.2 If bundling: add pinned dependency and extension registration; if not: add **README / docs** snippet with `pi install` and optional `git:` pin.
- [ ] 6.3 Document **`.pi/messenger/`** layout, **`PI_MESSENGER_DIR`** / **`PI_MESSENGER_GLOBAL`**, channel-first **`send` with `to:`**, and **`/messenger`** overlay; add a **when to use** subsection (swarm vs teams vs cleave).
- [ ] 6.4 Manual smoke: join messenger, post to `#memory`, create/claim a task if applicable; confirm no regressions when extension is absent (optional install path).
