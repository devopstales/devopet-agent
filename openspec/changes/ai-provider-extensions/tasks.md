## 1. Dependency and peer verification

- [ ] 1.1 Compare `pi-free` and `@0xkobold/pi-ollama` peer dependency ranges with devopet’s pinned `@mariozechner/pi-coding-agent`, `pi-ai`, and `pi-tui` versions; bump pi stack if required and justified.
- [ ] 1.2 Add `pi-free` and `@0xkobold/pi-ollama` to `package.json` `dependencies` with pinned versions; run `npm install` and resolve conflicts.

## 2. Extension manifest

- [ ] 2.1 Register both extensions under `pi.extensions` in `package.json` (order validated by smoke test); confirm no duplicate or broken extension paths.
- [ ] 2.2 Smoke-test startup: model picker shows new provider prefixes; run `/ollama-status` (or equivalent) when pi-ollama loads.

## 3. Ollama overlap mitigation

- [ ] 3.1 Validate model registration with both extensions enabled; apply upstream `hidden_models` or config workaround if duplicate Ollama cloud entries appear; document outcome in README.

## 4. Documentation

- [ ] 4.1 Add a short “Additional providers” section to `README.md` (or `docs/`) linking **pi-free** and **@0xkobold/pi-ollama**, `~/.pi/free.json`, Qwen/Kilo/NVIDIA/Ollama Cloud setup, and Ollama `baseUrl` / cloud keys.
- [ ] 4.2 Note security: never commit API keys; reference upstream issue URLs.

## 5. Verification

- [ ] 5.1 Run `npm run check` (or project CI) and fix regressions.
- [ ] 5.2 Manual spot-check: one OAuth-free provider (e.g. Zen if available), one key-based (NVIDIA or Ollama Cloud if keys available), and custom `OLLAMA_HOST` if a remote Ollama exists.
