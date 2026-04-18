/**
 * karpathy-guidelines — Inject Karpathy-inspired coding guidelines into agent context.
 *
 * Vendored from https://github.com/forrestchang/andrej-karpathy-skills (MIT).
 * Bundled text: config/karpathy-claude.md
 * Overrides: <project>/.devopet/karpathy-claude.md, then ~/.devopet/karpathy-claude.md
 *
 * Injects once per session on the first before_agent_start (display: false).
 */

import * as fs from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import { findDevopetProjectConfigDir, getDevopetGlobalConfigDir } from "./lib/devopet-config-paths.ts";

const BUNDLED = join(import.meta.dirname, "..", "config", "karpathy-claude.md");

function resolveKarpathyPath(cwd: string): string | null {
  const projectRoot = findDevopetProjectConfigDir(cwd);
  const candidates = [
    projectRoot ? join(projectRoot, "karpathy-claude.md") : null,
    join(getDevopetGlobalConfigDir(), "karpathy-claude.md"),
    BUNDLED,
  ].filter((p): p is string => p != null);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

export default function karpathyGuidelinesExtension(pi: ExtensionAPI): void {
  let injectedThisSession = false;

  pi.on("session_start", () => {
    injectedThisSession = false;
  });

  pi.on("before_agent_start", async (_event, ctx) => {
    if (injectedThisSession) return;

    const cwd = ctx.cwd ?? process.cwd();
    const path = resolveKarpathyPath(cwd);
    if (!path) return;

    let text: string;
    try {
      text = fs.readFileSync(path, "utf8");
    } catch {
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    injectedThisSession = true;

    return {
      message: {
        customType: "karpathy-guidelines",
        content: ["[Karpathy-inspired coding guidelines — apply for this session]", "", trimmed].join("\n"),
        display: false,
      },
    };
  });
}
