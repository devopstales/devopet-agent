/**
 * Applies SYSTEM.md / APPEND_SYSTEM.md resolution for pi + devopet trees via before_agent_start.
 * Upstream @mariozechner/pi-coding-agent already loads cwd-only .pi files; this layer adds
 * ancestor .pi, devopet paths, four-file append order, and unified replace precedence.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import {
  composeMarkdownSystemPrompt,
  needsCustomSystemPromptComposition,
} from "../lib/system-prompt-md.ts";

export default function systemPromptMdExtension(pi: ExtensionAPI): void {
  pi.on("before_agent_start", (_event, ctx) => {
    if (!needsCustomSystemPromptComposition(ctx.cwd)) {
      return undefined;
    }
    return {
      systemPrompt: composeMarkdownSystemPrompt(ctx.cwd),
    };
  });
}
