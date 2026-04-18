/**
 * SYSTEM.md / APPEND_SYSTEM.md resolution for pi + devopet trees.
 * See openspec/changes/system-prompt-md-devopet and docs/devopet-config.md.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { findDevopetProjectConfigDir, getDevopetGlobalConfigDir } from "./devopet-config-paths.ts";
import { buildSystemPrompt, CONFIG_DIR_NAME, getAgentDir, loadSkills } from "./pi-package.ts";

export function findAncestorPiConfigDir(startCwd: string): string | null {
  let cur = resolve(startCwd);
  const root = resolve("/");
  for (;;) {
    const candidate = join(cur, CONFIG_DIR_NAME);
    try {
      if (existsSync(candidate) && statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      /* ignore */
    }
    const parent = dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}

function readUtf8File(path: string): string | null {
  try {
    if (!existsSync(path)) return null;
    if (!statSync(path).isFile()) return null;
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

export interface ProjectContextFile {
  path: string;
  content: string;
}

function devopetPackageRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..");
}

/** Shipped `config/SYSTEM.md` (first layer in the merged replace string). */
export function bundledConfigSystemPath(): string {
  return join(devopetPackageRoot(), "config", "SYSTEM.md");
}

/** Project directory for `<project>/AGENTS.md`: parent of nearest `.devopet/`, else `cwd`. */
export function projectRootForMergedAgents(cwd: string): string {
  const d = findDevopetProjectConfigDir(cwd);
  return d ? dirname(d) : resolve(cwd);
}

/**
 * Merged **replace** content (concatenation order — see docs/devopet-config.md):
 * 0. packaged `config/SYSTEM.md`
 * 1. `<project>/.devopet/SYSTEM.md`
 * 2. `~/.devopet/SYSTEM.md`
 * 3. `<ancestor>/.pi/SYSTEM.md`
 * 4. `~/.pi/agent/SYSTEM.md`
 * 5. `<project>/AGENTS.md`
 *
 * Returns `null` if every segment is missing or empty.
 */
export function composeMergedSystemReplaceContent(cwd: string): string | null {
  const parts: string[] = [];
  const bundled = readUtf8File(bundledConfigSystemPath());
  if (bundled !== null && bundled.trim().length > 0) {
    parts.push(bundled.trimEnd());
  }

  const devProj = findDevopetProjectConfigDir(cwd);
  if (devProj) {
    const projSys = readUtf8File(join(devProj, "SYSTEM.md"));
    if (projSys !== null && projSys.trim().length > 0) {
      parts.push(projSys.trimEnd());
    }
  }

  const globalDevopet = readUtf8File(join(getDevopetGlobalConfigDir(), "SYSTEM.md"));
  if (globalDevopet !== null && globalDevopet.trim().length > 0) {
    parts.push(globalDevopet.trimEnd());
  }

  const piAncestor = findAncestorPiConfigDir(cwd);
  if (piAncestor) {
    const piAncSys = readUtf8File(join(piAncestor, "SYSTEM.md"));
    if (piAncSys !== null && piAncSys.trim().length > 0) {
      parts.push(piAncSys.trimEnd());
    }
  }

  const piAgentSys = readUtf8File(join(getAgentDir(), "SYSTEM.md"));
  if (piAgentSys !== null && piAgentSys.trim().length > 0) {
    parts.push(piAgentSys.trimEnd());
  }

  const agentsPath = join(projectRootForMergedAgents(cwd), "AGENTS.md");
  const agents = readUtf8File(agentsPath);
  if (agents !== null && agents.trim().length > 0) {
    parts.push(agents.trimEnd());
  }

  if (parts.length === 0) return null;
  return parts.join("\n\n");
}

function filterContextFilesExcludingMergedAgents(
  files: ProjectContextFile[],
  mergedAgentsPath: string,
): ProjectContextFile[] {
  const skip = resolve(mergedAgentsPath);
  return files.filter((f) => resolve(f.path) !== skip);
}

/**
 * Append chain after the effective replace base: pi global → pi project → devopet global → devopet project.
 * Omits missing files; dedupes by resolved path.
 */
export function collectAppendSegments(cwd: string): string[] {
  const piAgent = join(getAgentDir(), "APPEND_SYSTEM.md");
  const piProj = findAncestorPiConfigDir(cwd);
  const devGlob = join(getDevopetGlobalConfigDir(), "APPEND_SYSTEM.md");
  const devProj = findDevopetProjectConfigDir(cwd);
  const paths = [
    piAgent,
    piProj ? join(piProj, "APPEND_SYSTEM.md") : null,
    devGlob,
    devProj ? join(devProj, "APPEND_SYSTEM.md") : null,
  ].filter(Boolean) as string[];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of paths) {
    const r = resolve(p);
    if (seen.has(r)) continue;
    seen.add(r);
    const text = readUtf8File(r);
    if (text !== null && text.trim().length > 0) {
      out.push(text.trimEnd());
    }
  }
  return out;
}

function bothPiAppendFilesExist(cwd: string): boolean {
  const globalA = join(getAgentDir(), "APPEND_SYSTEM.md");
  const ancestor = findAncestorPiConfigDir(cwd);
  const projectA = ancestor ? join(ancestor, "APPEND_SYSTEM.md") : null;
  return (
    existsSync(globalA) &&
    statSync(globalA).isFile() &&
    projectA !== null &&
    existsSync(projectA) &&
    statSync(projectA).isFile()
  );
}

function devopetMarkdownConfigExists(cwd: string): boolean {
  const dg = getDevopetGlobalConfigDir();
  const dp = findDevopetProjectConfigDir(cwd);
  const candidates = [
    join(dg, "SYSTEM.md"),
    join(dg, "APPEND_SYSTEM.md"),
    dp ? join(dp, "SYSTEM.md") : null,
    dp ? join(dp, "APPEND_SYSTEM.md") : null,
  ].filter(Boolean) as string[];
  return candidates.some((p) => existsSync(p) && statSync(p).isFile());
}

function ancestorPiDiffersFromCwdPi(cwd: string): boolean {
  const anc = findAncestorPiConfigDir(cwd);
  if (!anc) return false;
  return resolve(anc) !== resolve(join(cwd, CONFIG_DIR_NAME));
}

/**
 * When true, devopet must rebuild the system prompt (append order, devopet paths, or ancestor .pi).
 */
export function needsCustomSystemPromptComposition(cwd: string): boolean {
  try {
    const bp = bundledConfigSystemPath();
    if (existsSync(bp) && statSync(bp).isFile()) return true;
  } catch {
    /* ignore */
  }
  if (devopetMarkdownConfigExists(cwd)) return true;
  if (bothPiAppendFilesExist(cwd)) return true;
  if (!ancestorPiDiffersFromCwdPi(cwd)) return false;
  const anc = findAncestorPiConfigDir(cwd);
  if (!anc) return false;
  return (
    (existsSync(join(anc, "SYSTEM.md")) && statSync(join(anc, "SYSTEM.md")).isFile()) ||
    (existsSync(join(anc, "APPEND_SYSTEM.md")) && statSync(join(anc, "APPEND_SYSTEM.md")).isFile())
  );
}

/** Mirrors pi resource-loader context discovery (global agent dir + ancestor walk). */
export function loadProjectContextFilesForPrompt(cwd: string, agentDir = getAgentDir()): ProjectContextFile[] {
  const loadFromDir = (dir: string): ProjectContextFile | null => {
    for (const filename of ["AGENTS.md", "CLAUDE.md"] as const) {
      const filePath = join(dir, filename);
      if (existsSync(filePath)) {
        try {
          return { path: filePath, content: readFileSync(filePath, "utf8") };
        } catch {
          /* skip */
        }
      }
    }
    return null;
  };

  const contextFiles: ProjectContextFile[] = [];
  const seenPaths = new Set<string>();

  const globalContext = loadFromDir(agentDir);
  if (globalContext) {
    contextFiles.push(globalContext);
    seenPaths.add(globalContext.path);
  }

  const ancestorFiles: ProjectContextFile[] = [];
  let currentDir = resolve(cwd);
  const root = resolve("/");
  for (;;) {
    const contextFile = loadFromDir(currentDir);
    if (contextFile && !seenPaths.has(contextFile.path)) {
      ancestorFiles.unshift(contextFile);
      seenPaths.add(contextFile.path);
    }
    if (currentDir === root) break;
    const parentDir = resolve(currentDir, "..");
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  contextFiles.push(...ancestorFiles);
  return contextFiles;
}

const DEFAULT_BUILTIN_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"] as const;

function loadSkillsForSession(cwd: string) {
  const bundledSkillsDir = join(devopetPackageRoot(), "skills");
  const skillPaths = existsSync(bundledSkillsDir) ? [bundledSkillsDir] : [];
  const { skills } = loadSkills({
    cwd,
    agentDir: getAgentDir(),
    skillPaths,
    includeDefaults: true,
  });
  return skills;
}

/**
 * Rebuild system prompt using the same buildSystemPrompt helper as pi, with devopet-aware
 * replace + append resolution.
 */
export function composeMarkdownSystemPrompt(cwd: string): string {
  const mergedReplace = composeMergedSystemReplaceContent(cwd);
  const appendSegments = collectAppendSegments(cwd);
  const appendJoined = appendSegments.length > 0 ? appendSegments.join("\n\n") : undefined;
  const mergedAgentsPath = join(projectRootForMergedAgents(cwd), "AGENTS.md");
  const contextFiles = filterContextFilesExcludingMergedAgents(
    loadProjectContextFilesForPrompt(cwd),
    mergedAgentsPath,
  );
  const skills = loadSkillsForSession(cwd);

  if (mergedReplace !== null && mergedReplace.trim().length > 0) {
    return buildSystemPrompt({
      cwd,
      customPrompt: mergedReplace,
      appendSystemPrompt: appendJoined,
      contextFiles,
      skills,
      selectedTools: [...DEFAULT_BUILTIN_TOOLS],
    });
  }

  return buildSystemPrompt({
    cwd,
    appendSystemPrompt: appendJoined,
    contextFiles,
    skills,
    selectedTools: [...DEFAULT_BUILTIN_TOOLS],
  });
}
