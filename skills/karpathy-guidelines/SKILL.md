---
name: karpathy-guidelines
description: Karpathy-inspired coding discipline — think before coding, simplicity first, surgical edits, goal-driven execution with verifiable success criteria. Vendored from forrestchang/andrej-karpathy-skills. Injected into agent context on the first turn of each session when enabled via extensions.
---

# Karpathy guidelines

devopet bundles **Karpathy-inspired** coding guidelines (MIT, [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)). Upstream ships them as **[`CLAUDE.md`](https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/refs/heads/main/CLAUDE.md)**. The same text lives under **`config/SYSTEM.md`** (§ Behavioral guidelines) and is mirrored in **`config/karpathy-claude.md`** for the `karpathy-guidelines` extension override paths.

## Overrides (devopet paths)

Precedence: **project** `.devopet/karpathy-claude.md` → **`~/.devopet/karpathy-claude.md`** → bundled `config/karpathy-claude.md`.

## Session injection

The **`karpathy-guidelines`** extension injects the resolved markdown on the **first agent turn** of each session (same class of injection as other `before_agent_start` context — effectively part of the model’s preamble for that session).

To disable, remove `./extensions/karpathy-guidelines.ts` from `package.json` `pi.extensions` (or replace the file with a no-op).
