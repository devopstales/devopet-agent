/**
 * cleave/workspace — Lightweight workspace management.
 *
 * Creates and manages workspace directories under ~/.pi/cleave/ containing:
 * - state.json: serialized CleaveState
 * - {n}-task.md: child task files
 *
 * Workspaces live outside the target repo to avoid polluting the working tree.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ChildPlan, CleaveState, SplitPlan } from "./types.js";
import type { OpenSpecContext } from "./openspec.js";

/** Base directory for all cleave workspaces. */
const CLEAVE_HOME = join(homedir(), ".pi", "cleave");

/**
 * Generate a unique workspace directory path from a directive.
 *
 * Creates a human-readable path: ~/.pi/cleave/add-jwt-auth/
 * Appends numeric suffix if collision: ~/.pi/cleave/add-jwt-auth-2/
 */
export function generateWorkspacePath(directive: string): string {
	mkdirSync(CLEAVE_HOME, { recursive: true });

	let slug = directive
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

	if (slug.length > 40) slug = slug.slice(0, 40).replace(/-$/, "");
	if (!slug) slug = "task";

	let candidate = join(CLEAVE_HOME, slug);
	if (!existsSync(candidate)) return candidate;

	let counter = 2;
	while (existsSync(join(CLEAVE_HOME, `${slug}-${counter}`))) counter++;
	return join(CLEAVE_HOME, `${slug}-${counter}`);
}

/**
 * Initialize a cleave workspace directory.
 *
 * Creates the workspace directory, state.json, and child task files.
 * Workspace lives under ~/.pi/cleave/, not inside the target repo.
 */
export function initWorkspace(
	state: CleaveState,
	plan: SplitPlan,
	_repoPath: string,
	openspecContext?: OpenSpecContext | null,
): string {
	const wsPath = generateWorkspacePath(state.directive);
	mkdirSync(wsPath, { recursive: true });

	state.workspacePath = wsPath;

	// Write initial state
	saveState(state);

	// Generate child task files
	for (let i = 0; i < plan.children.length; i++) {
		const child = plan.children[i];
		const taskContent = generateTaskFile(i, child, plan.children, state.directive, openspecContext);
		writeFileSync(join(wsPath, `${i}-task.md`), taskContent, "utf-8");
	}

	return wsPath;
}

/** Persist CleaveState to workspace/state.json */
export function saveState(state: CleaveState): void {
	if (!state.workspacePath) throw new Error("Cannot save state: workspacePath not set");
	const statePath = join(state.workspacePath, "state.json");
	writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
}

/** Load CleaveState from workspace/state.json */
export function loadState(workspacePath: string): CleaveState {
	const statePath = join(workspacePath, "state.json");
	if (!existsSync(statePath)) {
		throw new Error(`State file not found: ${statePath}`);
	}
	return JSON.parse(readFileSync(statePath, "utf-8"));
}

/**
 * Generate a child task markdown file.
 *
 * Slim template that the child agent reads to understand its mission.
 */
function generateTaskFile(
	taskId: number,
	child: ChildPlan,
	allChildren: ChildPlan[],
	rootDirective: string,
	openspecContext?: OpenSpecContext | null,
): string {
	const siblingRefs = allChildren
		.filter((_, i) => i !== taskId)
		.map((c, i) => `${i >= taskId ? i + 1 : i}:${c.label}`)
		.join(", ");

	const scopeList = child.scope.length > 0
		? child.scope.map((s) => `- \`${s}\``).join("\n")
		: "- (entire scope defined by description)";

	const depsNote = child.dependsOn.length > 0
		? `**Depends on:** ${child.dependsOn.join(", ")}`
		: "**Depends on:** none (independent)";

	// Build optional OpenSpec design context section
	const designSection = buildDesignSection(child, openspecContext);

	return `---
task_id: ${taskId}
label: ${child.label}
siblings: [${siblingRefs}]
---

# Task ${taskId}: ${child.label}

## Root Directive

> ${rootDirective}

## Mission

${child.description}

## Scope

${scopeList}

${depsNote}
${designSection}
## Contract

1. Only work on files within your scope
2. Update the Result section below when done
3. Commit your work with clear messages — do not push
4. If the task is too complex, set status to NEEDS_DECOMPOSITION

## Result

**Status:** PENDING

**Summary:**

**Artifacts:**

**Decisions Made:**

**Assumptions:**

**Interfaces Published:**

**Verification:**
- Command: \`\`
- Output:
- Edge cases:
`;
}

/**
 * Build the optional "Design Context" section for a child task file
 * when OpenSpec design.md and specs are available.
 *
 * Includes:
 * - Architecture decisions the child should follow
 * - File changes relevant to this child's scope
 * - Spec scenarios relevant to this child (acceptance criteria)
 */
function buildDesignSection(
	child: ChildPlan,
	ctx?: OpenSpecContext | null,
): string {
	if (!ctx) return "";

	const sections: string[] = [];

	// Architecture decisions — all decisions apply to all children
	if (ctx.decisions.length > 0) {
		sections.push(
			"### Architecture Decisions",
			"",
			"Follow these design decisions from the project's design.md:",
			"",
			...ctx.decisions.map((d) => `- ${d}`),
		);
	}

	// File changes relevant to this child
	if (ctx.fileChanges.length > 0) {
		const childLabelWords = child.label.replace(/-/g, " ").split(" ");
		const childDescLower = child.description.toLowerCase();

		const relevant = ctx.fileChanges.filter((fc) => {
			const fpLower = fc.path.toLowerCase();
			const pathParts = fpLower.split("/");
			return (
				childLabelWords.some((w) => w.length > 2 && pathParts.some((p) => p.includes(w))) ||
				childDescLower.includes(fpLower) ||
				child.scope.some((s) => fpLower.startsWith(s.replace(/\*+/g, "")))
			);
		});

		if (relevant.length > 0) {
			sections.push(
				"### File Changes (from design.md)",
				"",
				"These specific file changes are planned for this task:",
				"",
				...relevant.map((fc) => `- \`${fc.path}\` (${fc.action})`),
			);
		}
	}

	// Spec scenarios as acceptance criteria
	if (ctx.specScenarios.length > 0) {
		// Filter scenarios relevant to this child by matching domain/requirement
		// against the child's label and description
		const childText = `${child.label} ${child.description}`.toLowerCase();
		const relevant = ctx.specScenarios.filter((ss) => {
			const specText = `${ss.domain} ${ss.requirement}`.toLowerCase();
			return (
				childText.split(/\s+/).some((w) => w.length > 3 && specText.includes(w)) ||
				specText.split(/\s+/).some((w) => w.length > 3 && childText.includes(w))
			);
		});

		if (relevant.length > 0) {
			sections.push(
				"### Acceptance Criteria (from specs)",
				"",
				"Your implementation should satisfy these spec scenarios:",
				"",
			);
			for (const ss of relevant) {
				sections.push(`**${ss.domain} → ${ss.requirement}**`);
				for (const scenario of ss.scenarios) {
					// Indent scenario content for readability
					const scenarioLines = scenario.split("\n").map((l) => `  ${l}`);
					sections.push(...scenarioLines);
				}
				sections.push("");
			}
		}
	}

	if (sections.length === 0) return "";
	return "\n## Design Context\n\n" + sections.join("\n") + "\n\n";
}

/**
 * Read all task files from a workspace and return their contents.
 */
export function readTaskFiles(workspacePath: string): Map<number, string> {
	const tasks = new Map<number, string>();
	let i = 0;
	while (true) {
		const taskPath = join(workspacePath, `${i}-task.md`);
		if (!existsSync(taskPath)) break;
		tasks.set(i, readFileSync(taskPath, "utf-8"));
		i++;
	}
	return tasks;
}
