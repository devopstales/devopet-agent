## 1. Reference baseline

- [ ] 1.1 Read [pi-rewind](https://github.com/arpagon/pi-rewind) (`index`, `ui`, `core`, state)—record **git ref layout**, hooks, **`/rewind`**, **Esc+Esc** in **`COMPAT.md`** as **behavioral reference**, not as mandatory **npm** vendoring.
- [ ] 1.2 Spike (optional): temporary **`pi-rewind`** install **only** to compare behavior—do **not** treat as final integration.

## 2. First-party rewind extension

- [ ] 2.1 Scaffold **`extensions/<name>/`** implementing checkpoint scheduling, **`/rewind`**, redo, **Esc+Esc**, and git operations **per** **`specs/rewind-bundling/spec.md`** (reference: pi-rewind).
- [ ] 2.2 Register in **`package.json` `pi.extensions`** with load order **before** **`./extensions/dashboard`** per design.
- [ ] 2.3 Remove any transitional **`node_modules/pi-rewind`** loader; drop **`pi-rewind`** from **`dependencies`** when in-tree satisfies specs and tests.

## 3. Footer merge (option B)

- [ ] 3.1 Implement **shared-state bridge** (or equivalent) so **`DashboardFooter`** receives checkpoint count; render in **`extensions/dashboard/footer.ts`** (HUD line or badge).
- [ ] 3.2 Ensure **no second `setFooter`** factory from rewind code—rewind extension **must not** override **dashboard** footer without merged behavior.

## 4. Keybindings and docs

- [ ] 4.1 Test **Esc+Esc**; resolve pi-tui/dashboard conflicts; document overrides.
- [ ] 4.2 README: **`/rewind`**, footer, **cleave** vs rewind terminology; **[pi-rewind](https://github.com/arpagon/pi-rewind)** as **reference**.

## 5. Verification

- [ ] 5.1 **`npm run check`** if TS touched.
- [ ] 5.2 Manual: footer shows checkpoint indicator; **`/rewind`** + redo smoke on a small repo.
