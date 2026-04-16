## 1. Version and dependency spike

- [ ] 1.1 Evaluate **peer/version** alignment: **`pi-ask-user`** and **`@tintinweb/pi-tasks`** against devopet’s **`@mariozechner/pi-coding-agent`** / **`pi-tui`** (note upstream **pi-tasks** README pins **^0.62.0** vs devopet **0.61.x**); record compatible version range or gap.
- [ ] 1.2 Add **`pi-ask-user`** and **`@tintinweb/pi-tasks`** to **`package.json` `dependencies`** with chosen pins; run **`npm install`**; capture peer warnings.

## 2. Manifest and load order

- [ ] 2.1 Register both packages in **`pi.extensions`** with stable **`node_modules/...`** entry paths; choose order relative to **`./extensions/dashboard`** and other UI extensions after smoke (no footer/widget fight).
- [ ] 2.2 Smoke: session starts; **`ask_user`** appears in tool set; **`/tasks`** opens; task widget renders without crash.

## 3. Documentation

- [ ] 3.1 README (or dedicated doc): **ask-back** overview—**pi-ask-user** (**`ask_user`**, skill) + **pi-tasks** (**Task***, widget, **`PI_TASKS`**); links to npm and GitHub repos.
- [ ] 3.2 Document **optional** **`@tintinweb/pi-subagents`** for **`TaskExecute`**; clarify v1 may omit it.

## 4. Verification

- [ ] 4.1 **`npm run check`** if TypeScript or manifests change; fix regressions.
- [ ] 4.2 Manual: one **`ask_user`** round-trip; create/list/update a task; confirm **`PI_TASKS=off`** path if documented.
