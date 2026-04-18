import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DURABLE_ROOTS = ["docs", "openspec"] as const;
/** Prefer devopet layout; legacy `.pi/memory` still checked for existing repos. */
const MEMORY_TRANSPORT_PATHS = [".devopet/memory/facts.jsonl", ".pi/memory/facts.jsonl"] as const;

export interface LifecycleArtifactCheckResult {
	untracked: string[];
}

export interface MemoryTransportState {
	tracked: boolean;
	dirty: boolean;
	untracked: boolean;
	path: string;
}

export function isDurableLifecycleArtifact(filePath: string): boolean {
	const normalized = filePath.replaceAll("\\", "/").replace(/^\.\//, "");
	return DURABLE_ROOTS.some((root) => normalized === root || normalized.startsWith(`${root}/`));
}

export function parsePorcelainZ(stdout: string): string[] {
	const entries = stdout.split("\0").filter(Boolean);
	const untracked: string[] = [];
	for (const entry of entries) {
		if (entry.startsWith("?? ")) {
			untracked.push(entry.slice(3));
		}
	}
	return untracked;
}

export function detectUntrackedLifecycleArtifacts(repoPath: string): string[] {
	try {
		const stdout = execFileSync(
			"git",
			["status", "--porcelain", "--untracked-files=all", "-z", "--", ...DURABLE_ROOTS],
			{ cwd: repoPath, encoding: "utf-8" },
		);
		return parsePorcelainZ(stdout)
			.filter(isDurableLifecycleArtifact)
			.sort((a, b) => a.localeCompare(b));
	} catch {
		return [];
	}
}

function memoryStateFromPorcelain(stdout: string, relPath: string): MemoryTransportState | null {
	const line = stdout
		.split("\n")
		.map((l) => l.replaceAll("\\", "/"))
		.find((l) => l.trimEnd().endsWith(relPath));
	if (!line) return null;
	const normalized = line.trim();
	if (normalized.startsWith("?? ")) {
		return { tracked: false, dirty: true, untracked: true, path: relPath };
	}
	return { tracked: true, dirty: true, untracked: false, path: relPath };
}

export function detectMemoryTransportState(repoPath: string): MemoryTransportState {
	const fallback: MemoryTransportState = {
		tracked: true,
		dirty: false,
		untracked: false,
		path: MEMORY_TRANSPORT_PATHS[0],
	};
	try {
		const stdout = execFileSync(
			"git",
			["status", "--porcelain", "--untracked-files=all", "--", ...MEMORY_TRANSPORT_PATHS],
			{ cwd: repoPath, encoding: "utf-8" },
		).trim();
		if (!stdout) return fallback;
		for (const p of MEMORY_TRANSPORT_PATHS) {
			const st = memoryStateFromPorcelain(stdout, p);
			if (st?.untracked) return st;
		}
		for (const p of MEMORY_TRANSPORT_PATHS) {
			const st = memoryStateFromPorcelain(stdout, p);
			if (st?.dirty) return st;
		}
		return fallback;
	} catch {
		return fallback;
	}
}

export function formatLifecycleArtifactError(result: LifecycleArtifactCheckResult): string {
	const lines = [
		"Untracked durable lifecycle artifacts detected.",
		"",
		"The following files live under docs/ or openspec/ and are treated as version-controlled project documentation:",
		...result.untracked.map((file) => `- ${file}`),
		"",
		"Resolution:",
		"- git add the durable lifecycle files listed above, or",
		"- move transient scratch artifacts outside docs/ and openspec/.",
	];
	return lines.join("\n");
}

export function formatMemoryTransportNotice(state: MemoryTransportState): string | null {
	if (!state.dirty) return null;
	const lines = [
		"Memory transport drift detected.",
		"",
		`${state.path} differs from the live branch state, but this is reported separately from durable lifecycle artifact blockers.`,
		"",
		"Suggested resolution:",
		"- run `/memory export` if you intend to reconcile tracked memory transport, or",
		"- leave it alone if the drift is incidental branch-local memory state.",
	];
	if (state.untracked) {
		lines.splice(3, 0, `${state.path} is currently untracked.`);
	}
	return lines.join("\n");
}

export function assertTrackedLifecycleArtifacts(repoPath: string): void {
	const untracked = detectUntrackedLifecycleArtifacts(repoPath);
	if (untracked.length === 0) return;
	throw new Error(formatLifecycleArtifactError({ untracked }));
}

function runCli(): void {
	const repoPath = process.cwd();
	assertTrackedLifecycleArtifacts(repoPath);
	const memoryNotice = formatMemoryTransportNotice(detectMemoryTransportState(repoPath));
	if (memoryNotice) {
		process.stdout.write(`${memoryNotice}\n`);
	}
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
	runCli();
}
