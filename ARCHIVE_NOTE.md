# Omegon-Pi (Archived)

This is the legacy TypeScript-based Omegon harness built on the pi coding agent framework.

**This repository is archived.** The active Omegon development continues in the Rust-native binary:
- **[omegon](https://github.com/styrene-lab/omegon)** — main repo (design docs, skills, specs, Rust binary)
- **[omegon-core](https://github.com/styrene-lab/omegon-core)** — Rust workspace

## What's Here

- `extensions/` — Pi extensions (secrets, auth, memory, cleave, design-tree, openspec, dashboard, etc.)
- `vendor/pi-mono` — Fork of the pi coding agent framework
- `bin/` — Node.js entrypoints (omegon.mjs, pi.mjs)
- `npm/` — Platform-specific npm packages
- `skills/` — Markdown skill definitions (shared with Rust repo)
- `themes/` — Alpharius theme (shared with Rust repo)

## Install (Legacy)

```sh
npm install -g omegon
```

Requires Node.js 20+.

## License

BSL 1.1 — © 2024–2026 Black Meridian, LLC
