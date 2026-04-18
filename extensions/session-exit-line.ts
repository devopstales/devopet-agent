/**
 * session-exit-line — After a session ends, print session id and resume hint on stderr.
 *
 * Helps operators capture `devopet --resume <uuid>` without hunting JSONL paths.
 * Uses DEVOPET_CLI_NAME from bin/devopet-agent.mjs (devopet vs devopet-agent).
 */

import { basename } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

function cliHint(): string {
  const fromEnv = process.env.DEVOPET_CLI_NAME?.trim();
  if (fromEnv) return fromEnv;
  const arg = process.argv[1];
  if (!arg) return "devopet";
  let name = basename(arg);
  if (name.endsWith(".mjs")) name = name.slice(0, -".mjs".length);
  return name || "devopet";
}

function getSessionId(ctx: ExtensionContext): string | undefined {
  try {
    const id = ctx.sessionManager.getSessionId();
    if (typeof id === "string" && id.trim()) return id.trim();
  } catch {
    /* ignore */
  }
  const header = ctx.sessionManager.getHeader?.();
  if (header && typeof header.id === "string" && header.id.trim()) return header.id.trim();
  return undefined;
}

export default function sessionExitLineExtension(pi: ExtensionAPI): void {
  pi.on("session_shutdown", async (_event, ctx) => {
    const id = getSessionId(ctx);
    if (!id) return;

    const exe = cliHint();
    const lines = [
      "",
      `${exe}: session ended`,
      `  session id: ${id}`,
      `  resume:     ${exe} --resume ${id}`,
      "",
    ];
    // stderr keeps the hint visible after the TUI releases the screen
    console.error(lines.join("\n"));
  });
}
