# Slash commands

In the interactive terminal UI, commands start with **`/`**. This page splits **upstream Pi** built-ins (shipped inside `@mariozechner/pi-coding-agent`) from **devopet** commands registered by this repo’s extensions.

The exact list in your install can also be inspected in-app (command palette / help, depending on pi-tui version). After upgrades, run the agent and check the slash-command list if something moved.

---

## 1. Default Pi slash commands (upstream)

These come from Pi’s core **`BUILTIN_SLASH_COMMANDS`** (see `node_modules/@mariozechner/pi-coding-agent/dist/core/slash-commands.js` in an installed package). Descriptions below match that list; wording may change slightly with Pi releases.

| Command | Description |
|---------|-------------|
| `/settings` | Open settings menu |
| `/model` | Select model (opens selector UI) |
| `/scoped-models` | Enable/disable models for Ctrl+P cycling |
| `/export` | Export session (HTML default, or specify path: `.html` / `.jsonl`) |
| `/import` | Import and resume a session from a JSONL file |
| `/share` | Share session as a secret GitHub gist |
| `/copy` | Copy last agent message to clipboard |
| `/name` | Set session display name |
| `/session` | Show session info and stats |
| `/changelog` | Show changelog entries |
| `/hotkeys` | Show all keyboard shortcuts |
| `/fork` | Create a new fork from a previous message |
| `/tree` | Navigate session tree (switch branches) |
| `/login` | Login with OAuth provider |
| `/logout` | Logout from OAuth provider |
| `/new` | Start a new session |
| `/compact` | Manually compact the session context |
| `/resume` | Resume a different session |
| `/reload` | Reload keybindings, extensions, skills, prompts, and themes |
| `/quit` | Quit Pi |

**Related upstream docs:** [keybindings](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/keybindings.md), [session](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/session.md), [settings](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md).

Shell flags (`--print`, `--continue`, …) are documented by **`pi --help`** and are not slash commands.

---

## 2. devopet slash commands

These are registered by devopet’s bundled extensions (`package.json` → `pi.extensions`). They appear alongside Pi’s built-ins. Several use the shared **slash-command bridge** (structured execution, agent allowlists) — see `extensions/lib/slash-command-bridge.ts`.

### Bootstrap and lifecycle

| Command | Purpose |
|---------|---------|
| `/bootstrap` | First-time setup, dependency checks, installs |
| `/update` | Update devopet / dependencies and restart flow |
| `/refresh` | Reload caches and extensions without replacing the package |
| `/restart` | Restart the agent process (coordinated exit code for the wrapper) |

### Auth, providers, secrets

| Command | Purpose |
|---------|---------|
| `/auth` | Auth status and diagnostics (git, GitHub, GitLab, AWS, k8s, OCI, …) |
| `/whoami` | Identity / auth summary |
| `/connect` | Provider OAuth and API keys (via bundled **ai-provider-connect**, aligned with [pi-connect](https://www.npmjs.com/package/pi-connect)) |
| `/disconnect` | Disconnect provider session |
| `/secrets` | Resolve secrets from env, commands, or keychains |

### Security and permissions

| Command | Purpose |
|---------|---------|
| `/security` | Status, audit log, policy, reload (`security-engine`) |
| `/secure` | Project security sweep and optional installer helpers |
| `/yolo` | Permission / “yolo” mode helpers (`permission-manager`) |

### Inference, effort, and routing

| Command | Purpose |
|---------|---------|
| `/effort` | Effort tiers and caps |
| `/providers` | Provider-related controls |
| `/context` | Context / routing diagnostics |
| `/local-models` | List or manage local models |
| `/local-status` | Local inference status |
| `/ollama` | Ollama-oriented helpers |
| `/offline` | Switch toward offline drivers |
| `/online` | Switch back from offline |
| `/local` | Jump to **local** effort tier |
| `/retribution` | Jump to **retribution** tier |
| `/victory` | Jump to **victory** tier |
| `/gloriana` | Jump to **gloriana** tier |

### UI, media, and tools

| Command | Purpose |
|---------|---------|
| `/dash` | Toggle dashboard footer (compact ↔ raised) |
| `/dashboard` | Dashboard side panel and modes (`open`, `compact`, `raised`, `panel`, `focus`, …) |
| `/web-ui` | Localhost read-only web dashboard (`start` / `stop` / `status` / `open`) |
| `/view` | Inline viewer (images, PDFs, code, …) |
| `/edit` | Viewport edit helpers |
| `/zoom` | Zoom / viewport level |
| `/render` | Diagrams and image rendering in-terminal |
| `/style` | Design system reference |
| `/vault` | Markdown vault / wikilink viewport |
| `/splash` | Splash / startup animation controls |
| `/chronos` | Authoritative clock / date (avoids model date drift) |
| `/mcp` | MCP bridge — list, configure, and attach MCP servers |
| `/profile` | Tool profiles (`manage_tools`) |

### OpenSpec

| Command | Purpose |
|---------|---------|
| `/opsx:propose` | Create a new OpenSpec change |
| `/opsx:spec` | Generate or add specs for a change |
| `/opsx:ff` | Fast-forward: design + tasks from specs |
| `/opsx:status` | List active changes and lifecycle hints |
| `/opsx:verify` | Verification / archive readiness for a change |
| `/opsx:archive` | Archive a completed change |
| `/opsx:apply` | Continue implementation (delegates toward `/cleave` workflow) |

### Cleave and assessment

| Command | Purpose |
|---------|---------|
| `/cleave` | Task decomposition and parallel worktrees |
| `/cleave resume` | Resume a cleave-oriented run |
| `/cleave inspect` | Inspect cleave state |
| `/assess` | Adversarial review (interactive) or structured subcommands: **`spec`**, **`diff`**, **`cleave`**, **`complexity`**, **`design`** (e.g. `/assess spec …`) |

### Design tree

| Command | Purpose |
|---------|---------|
| `/design` | List, create, update, branch, decide, implement design nodes |
| `/migrate` | Design-tree migration helpers |

### Project memory

| Command | Purpose |
|---------|---------|
| `/memory` | Memory store, recall, minds, compaction, … |
| `/exit` | Session exit / memory epilogue hooks (extension-registered) |

---

### See also

- [devopet-config.md](./devopet-config.md) — `~/.devopet` and `.devopet/` paths  
- [permission-manager.md](./permission-manager.md) — Permission policy files, `toolPaths`, `/yolo`  
- [security-guard.md](./security-guard.md) — Security guard YAML, `/security`, precedence vs `permissions.jsonc`  
- Feature docs: [cleave.md](./cleave.md), [project-memory.md](./project-memory.md), [dashboard.md](./dashboard.md), [openspec.md](./openspec.md), [README.md](../README.md) extension tables  
