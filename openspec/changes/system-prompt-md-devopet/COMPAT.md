# system-prompt-md-devopet — upstream compatibility

## `@mariozechner/pi-coding-agent`

- **`before_agent_start`** exposes `systemPrompt` on the event and allows **`BeforeAgentStartEventResult.systemPrompt`** to replace the effective prompt for the turn. Multiple extensions chain in load order; each handler sees the latest `systemPrompt`. See `dist/core/extensions/types.d.ts` and `dist/core/extensions/runner.js` (`emitBeforeAgentStart`).
- **`DefaultResourceLoader`** (`dist/core/resource-loader.js`) already implements **`discoverSystemPromptFile()`** and **`discoverAppendSystemPromptFile()`** for **project `cwd/.pi`** and **`~/.pi/agent`**, but:
  - **Append**: only one file is used (project wins over global), not **global-then-project** concatenation.
  - **Project `.pi`**: uses **`cwd`** only, not an **ancestor** walk.
- devopet **`extensions/system-prompt-md`** rebuilds via **`buildSystemPrompt`** using a **merged replace** string (layers 0–5 in `docs/devopet-config.md`): packaged **`config/SYSTEM.md`**, **`<project>/.devopet/SYSTEM.md`**, **`~/.devopet/SYSTEM.md`**, **`<ancestor>/.pi/SYSTEM.md`**, **`~/.pi/agent/SYSTEM.md`**, **`<project>/AGENTS.md`**, then **`APPEND_SYSTEM.md`** segments in the documented append order.

## Settings merge (`devopet-settings-json-locations`)

- Pi’s **`SettingsManager`** (`dist/core/settings-manager.js`) merges **`~/.pi/agent/settings.json`** with **`<cwd>/.pi/settings.json`** only. There is **no extension hook** to inject **`~/.devopet/settings.json`** into that manager in current upstream builds.
- devopet implements **documented merge order** and **path resolution helpers** in **`extensions/lib/devopet-settings-merge.ts`**, uses merged layers for **defaults theme selection** in **`extensions/defaults.ts`**, and documents full precedence in **`docs/devopet-config.md`**. Runtime application of devopet-only keys (e.g. theme) still depends on pi reading the same files; where pi does not, operators should mirror critical keys under **`.pi/settings.json`** until upstream adds a merge hook.
