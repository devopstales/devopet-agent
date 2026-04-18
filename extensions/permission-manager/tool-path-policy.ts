/**
 * Path-scoped tool rules (`toolPaths` in devopet permissions JSONC) — glob match + helpers.
 */
import { basename, dirname, normalize, resolve } from "node:path";
import {
	compileWildcardPatternEntries,
	findCompiledWildcardMatch,
} from "../../node_modules/pi-permission-system/src/wildcard-matcher.js";
import type { PermissionState } from "../../node_modules/pi-permission-system/src/types.js";

export type ToolPathPermissions = Record<string, Record<string, PermissionState>>;

/** Built-in tools that take a filesystem `path` (devopet path policy applies). */
export const PATH_SCOPED_TOOLS = new Set(["read", "write", "edit"]);

export function normalizePathForPermission(pathValue: string): string {
	const normalizedPath = normalize(pathValue.trim());
	return process.platform === "win32" ? normalizedPath.replace(/\\/g, "/").toLowerCase() : normalizedPath;
}

/**
 * Resolve a path from tool input against cwd (absolute, normalized for matching).
 */
export function resolveAbsoluteToolPath(rawPath: string, cwd: string): string {
	const t = rawPath.trim();
	if (!t) {
		return "";
	}
	const n = normalize(t);
	const abs = n.startsWith("/") || /^[A-Za-z]:[\\/]/.test(n) ? n : resolve(cwd, n);
	return normalizePathForPermission(abs);
}

/**
 * Extract `path` / `filePath` / `file_path` from tool input.
 */
export function extractToolInputPath(input: unknown, cwd: string): string | null {
	if (typeof input !== "object" || input === null) {
		return null;
	}
	const rec = input as Record<string, unknown>;
	const raw =
		typeof rec.path === "string"
			? rec.path
			: typeof rec.filePath === "string"
				? rec.filePath
				: typeof rec.file_path === "string"
					? rec.file_path
					: null;
	if (!raw?.trim()) {
		return null;
	}
	return resolveAbsoluteToolPath(raw, cwd) || null;
}

/**
 * Suggested glob for persisting an allow rule (e.g. `/tmp/test.txt` → `/tmp/*.txt`).
 */
export function suggestPathGlob(absolutePath: string): string {
	const dir = dirname(absolutePath);
	const base = basename(absolutePath);
	const dot = base.lastIndexOf(".");
	if (dot > 0 && dot < base.length - 1) {
		const ext = base.slice(dot);
		return `${dir}/*${ext}`;
	}
	return `${dir}/*`;
}

export function matchToolPathPermission(
	toolPaths: ToolPathPermissions | undefined,
	toolName: string,
	absolutePath: string,
): PermissionState | null {
	if (!toolPaths) {
		return null;
	}
	const rules = toolPaths[toolName];
	if (!rules || Object.keys(rules).length === 0) {
		return null;
	}
	const compiled = compileWildcardPatternEntries(Object.entries(rules));
	const m = findCompiledWildcardMatch(compiled, absolutePath);
	if (!m) {
		return null;
	}
	return m.state;
}
