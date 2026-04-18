import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Root directory of the installed `@mariozechner/pi-coding-agent` package (for deep imports
 * not exposed via package.json "exports").
 */
export function getPiCodingAgentRoot(): string {
  const entry = fileURLToPath(import.meta.resolve("@mariozechner/pi-coding-agent"));
  return join(dirname(entry), "..");
}

const requirePi = createRequire(join(getPiCodingAgentRoot(), "package.json"));

export const buildSystemPrompt = requirePi("./dist/core/system-prompt.js")
  .buildSystemPrompt as (options?: Record<string, unknown>) => string;
export const loadSkills = requirePi("./dist/core/skills.js").loadSkills as (options?: Record<string, unknown>) => {
  skills: Array<{ name: string; filePath: string; disableModelInvocation?: boolean }>;
  diagnostics: unknown[];
};
export const CONFIG_DIR_NAME = requirePi("./dist/config.js").CONFIG_DIR_NAME as string;
export const getAgentDir = requirePi("./dist/config.js").getAgentDir as () => string;
