/**
 * devopet permission policy: `~/.devopet/permissions.jsonc` + `.devopet/permissions.jsonc` (local overrides global).
 * Shape matches [pi-permission-system](https://www.npmjs.com/package/pi-permission-system) (`defaultPolicy`, maps per category).
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { GlobalPermissionConfig, PermissionDefaultPolicy, PermissionState } from "../../node_modules/pi-permission-system/src/types.js";
import type { ToolPathPermissions } from "./tool-path-policy.ts";

const PERMISSION_STATE = new Set<PermissionState>(["allow", "deny", "ask"]);

/** devopet extension: optional per-path rules for built-in path tools (`read` / `write` / `edit`). */
export type DevopetPermissionConfig = GlobalPermissionConfig & {
	toolPaths?: ToolPathPermissions;
};

/** Built-in policy when no config file exists: confirm everything (`ask`). */
export const DEFAULT_ASK_POLICY: DevopetPermissionConfig = {
	defaultPolicy: {
		tools: "ask",
		bash: "ask",
		mcp: "ask",
		skills: "ask",
		special: "ask",
	},
	tools: {},
	bash: {},
	mcp: {},
	skills: {},
	special: {},
	toolPaths: {},
};

export type DevopetPolicyResolved =
	| {
			kind: "policy";
			mergedPath: string;
			/** No file on disk — synthetic default-ask policy. */
			source: "global" | "project" | "merged" | "default-ask";
			/** Only when `yolo: true` in permissions JSONC (explicit opt-in). */
			yolo: boolean;
	  }
	| { kind: "error"; path: string; message: string };

export function stripJsonComments(input: string): string {
	let output = "";
	let inString = false;
	let stringQuote: '"' | "'" | "" = "";
	let escaping = false;
	let inLineComment = false;
	let inBlockComment = false;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		const next = input[i + 1] || "";

		if (inLineComment) {
			if (char === "\n") {
				inLineComment = false;
				output += char;
			}
			continue;
		}

		if (inBlockComment) {
			if (char === "*" && next === "/") {
				inBlockComment = false;
				i++;
			}
			continue;
		}

		if (!inString && char === "/" && next === "/") {
			inLineComment = true;
			i++;
			continue;
		}

		if (!inString && char === "/" && next === "*") {
			inBlockComment = true;
			i++;
			continue;
		}

		output += char;

		if (!inString && (char === '"' || char === "'")) {
			inString = true;
			stringQuote = char;
			escaping = false;
			continue;
		}

		if (!inString) {
			continue;
		}

		if (escaping) {
			escaping = false;
			continue;
		}

		if (char === "\\") {
			escaping = true;
			continue;
		}

		if (char === stringQuote) {
			inString = false;
			stringQuote = "";
		}
	}

	return output;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPermissionState(value: unknown): value is PermissionState {
	return typeof value === "string" && PERMISSION_STATE.has(value as PermissionState);
}

function validatePermissionMap(label: string, value: unknown, path: string): Record<string, PermissionState> {
	if (!isRecord(value)) {
		throw new Error(`${path}: expected object for ${label}`);
	}
	const out: Record<string, PermissionState> = {};
	for (const [k, v] of Object.entries(value)) {
		if (!isPermissionState(v)) {
			throw new Error(`${path}: invalid permission token for key '${k}' in ${label} (expected allow|deny|ask)`);
		}
		out[k] = v;
	}
	return out;
}

function validateToolPaths(value: unknown, path: string): ToolPathPermissions {
	if (value === undefined) {
		return {};
	}
	if (!isRecord(value)) {
		throw new Error(`${path}: toolPaths must be an object`);
	}
	const out: ToolPathPermissions = {};
	for (const [toolName, inner] of Object.entries(value)) {
		if (!isRecord(inner)) {
			throw new Error(`${path}: toolPaths.${toolName} must be an object`);
		}
		const innerOut: Record<string, PermissionState> = {};
		for (const [pat, st] of Object.entries(inner)) {
			if (!isPermissionState(st)) {
				throw new Error(
					`${path}: invalid permission for toolPaths['${toolName}']['${pat}'] (expected allow|deny|ask)`,
				);
			}
			innerOut[pat] = st;
		}
		out[toolName] = innerOut;
	}
	return out;
}

function mergeToolPathPermissions(
	global_: ToolPathPermissions | undefined,
	project: ToolPathPermissions | undefined,
): ToolPathPermissions {
	const names = new Set([...Object.keys(global_ ?? {}), ...Object.keys(project ?? {})]);
	const out: ToolPathPermissions = {};
	for (const n of names) {
		out[n] = { ...(global_?.[n] ?? {}), ...(project?.[n] ?? {}) };
	}
	return out;
}

function validateDefaultPolicy(value: unknown, path: string): PermissionDefaultPolicy {
	if (!isRecord(value)) {
		throw new Error(`${path}: defaultPolicy must be an object`);
	}
	const d = value;
	const tools = isPermissionState(d.tools) ? d.tools : null;
	const bash = isPermissionState(d.bash) ? d.bash : null;
	const mcp = isPermissionState(d.mcp) ? d.mcp : null;
	const skills = isPermissionState(d.skills) ? d.skills : null;
	const special = isPermissionState(d.special) ? d.special : null;
	if (!tools || !bash || !mcp || !skills || !special) {
		throw new Error(
			`${path}: defaultPolicy must set tools, bash, mcp, skills, and special to allow|deny|ask`,
		);
	}
	return { tools, bash, mcp, skills, special };
}

/**
 * Parse one permissions document: optional root `yolo` (boolean) — explicit opt-in to disable enforcement.
 * If `defaultPolicy` is missing, it is filled from {@link DEFAULT_ASK_POLICY}.
 */
export function parsePolicyDocument(
	path: string,
	raw: string,
): { config: DevopetPermissionConfig; yolo: boolean | undefined } {
	let parsed: unknown;
	try {
		parsed = JSON.parse(stripJsonComments(raw));
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`${path}: invalid JSONC (${msg})`);
	}
	if (!isRecord(parsed)) {
		throw new Error(`${path}: root must be an object`);
	}
	let yolo: boolean | undefined;
	if ("yolo" in parsed) {
		if (typeof parsed.yolo !== "boolean") {
			throw new Error(`${path}: yolo must be a boolean`);
		}
		yolo = parsed.yolo;
	}
	const working: Record<string, unknown> = { ...parsed };
	delete working.yolo;

	if (working.defaultPolicy === undefined) {
		working.defaultPolicy = { ...DEFAULT_ASK_POLICY.defaultPolicy };
	}

	const defaultPolicy = validateDefaultPolicy(working.defaultPolicy, path);
	const tools =
		working.tools !== undefined ? validatePermissionMap("tools", working.tools, path) : {};
	const bash =
		working.bash !== undefined ? validatePermissionMap("bash", working.bash, path) : {};
	const mcp = working.mcp !== undefined ? validatePermissionMap("mcp", working.mcp, path) : {};
	const skills =
		working.skills !== undefined ? validatePermissionMap("skills", working.skills, path) : {};
	const special =
		working.special !== undefined ? validatePermissionMap("special", working.special, path) : {};
	const toolPaths = validateToolPaths(working.toolPaths, path);

	return {
		config: {
			defaultPolicy,
			tools,
			bash,
			mcp,
			skills,
			special,
			toolPaths,
		},
		yolo,
	};
}

/** Parse and validate a single policy file (JSONC), no `yolo` key. */
export function parsePolicyFile(path: string, raw: string): DevopetPermissionConfig {
	return parsePolicyDocument(path, raw).config;
}

function mergeDefaultPolicy(
	global_: PermissionDefaultPolicy,
	local?: Partial<PermissionDefaultPolicy>,
): PermissionDefaultPolicy {
	if (!local) {
		return global_;
	}
	return {
		tools: local.tools ?? global_.tools,
		bash: local.bash ?? global_.bash,
		mcp: local.mcp ?? global_.mcp,
		skills: local.skills ?? global_.skills,
		special: local.special ?? global_.special,
	};
}

/** Merge global + project configs; project keys override per map and defaultPolicy fields. */
export function mergePolicies(
	globalCfg: DevopetPermissionConfig,
	projectCfg: DevopetPermissionConfig,
): DevopetPermissionConfig {
	return {
		defaultPolicy: mergeDefaultPolicy(globalCfg.defaultPolicy, projectCfg.defaultPolicy),
		tools: { ...globalCfg.tools, ...projectCfg.tools },
		bash: { ...globalCfg.bash, ...projectCfg.bash },
		mcp: { ...globalCfg.mcp, ...projectCfg.mcp },
		skills: { ...globalCfg.skills, ...projectCfg.skills },
		special: { ...globalCfg.special, ...projectCfg.special },
		toolPaths: mergeToolPathPermissions(globalCfg.toolPaths, projectCfg.toolPaths),
	};
}

const GLOBAL_PATH = () => join(homedir(), ".devopet", "permissions.jsonc");
const EFFECTIVE_PATH = () => join(homedir(), ".devopet", "permissions.effective.jsonc");

function projectPath(cwd: string): string {
	return join(cwd, ".devopet", "permissions.jsonc");
}

function readIfExists(path: string): string | null {
	try {
		if (!existsSync(path)) {
			return null;
		}
		return readFileSync(path, "utf8");
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`${path}: ${msg}`);
	}
}

function writeAtomic(path: string, body: string): void {
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
	writeFileSync(tmp, body, "utf8");
	renameSync(tmp, path);
}

/** Write effective policy file; returns path (for PermissionManager). */
export function persistEffectivePolicy(config: DevopetPermissionConfig): string {
	const p = EFFECTIVE_PATH();
	writeAtomic(p, `${JSON.stringify(config, null, 2)}\n`);
	return p;
}

/**
 * If `~/.devopet/permissions.effective.jsonc` is missing, create it with the built-in
 * default-ask policy (same as when no global/project permissions files exist).
 * Called once when the permission-manager extension loads so the path exists at devopet start.
 */
export function ensureEffectivePolicyFileIfMissing(): void {
	const p = EFFECTIVE_PATH();
	if (existsSync(p)) {
		return;
	}
	writeAtomic(p, `${JSON.stringify(DEFAULT_ASK_POLICY, null, 2)}\n`);
}

/**
 * Resolve devopet policy for cwd. Writes merged effective file to ~/.devopet/permissions.effective.jsonc`.
 * Missing both files → built-in **default-ask** (not YOLO). **YOLO** only if `yolo: true` in JSONC (explicit).
 */
export function resolveDevopetPermissionPolicy(cwd: string): DevopetPolicyResolved {
	const gPath = GLOBAL_PATH();
	const pPath = projectPath(cwd);
	const gRaw = readIfExists(gPath);
	const pRaw = readIfExists(pPath);

	const effective = EFFECTIVE_PATH();

	try {
		if (!gRaw && !pRaw) {
			writeAtomic(effective, `${JSON.stringify(DEFAULT_ASK_POLICY, null, 2)}\n`);
			return { kind: "policy", mergedPath: effective, source: "default-ask", yolo: false };
		}

		let merged: DevopetPermissionConfig;
		let source: "global" | "project" | "merged";
		let mergedYolo = false;

		if (gRaw && pRaw) {
			const gDoc = parsePolicyDocument(gPath, gRaw);
			const pDoc = parsePolicyDocument(pPath, pRaw);
			merged = mergePolicies(gDoc.config, pDoc.config);
			source = "merged";
			const y = pDoc.yolo !== undefined ? pDoc.yolo : gDoc.yolo;
			mergedYolo = y ?? false;
		} else if (gRaw) {
			const gDoc = parsePolicyDocument(gPath, gRaw);
			merged = gDoc.config;
			mergedYolo = gDoc.yolo ?? false;
			source = "global";
		} else {
			const pDoc = parsePolicyDocument(pPath, pRaw!);
			merged = pDoc.config;
			mergedYolo = pDoc.yolo ?? false;
			source = "project";
		}

		writeAtomic(effective, `${JSON.stringify(merged, null, 2)}\n`);
		return { kind: "policy", mergedPath: effective, source, yolo: mergedYolo };
	} catch (e) {
		const path = gRaw && !pRaw ? gPath : !gRaw && pRaw ? pPath : `${gPath} / ${pPath}`;
		const message = e instanceof Error ? e.message : String(e);
		return { kind: "error", path, message };
	}
}

export function effectivePolicyPathForTests(): string {
	return EFFECTIVE_PATH();
}

export function globalPolicyPathForTests(): string {
	return GLOBAL_PATH();
}

/** User-facing path for `~/.devopet/permissions.jsonc`. */
export function globalPermissionsJsoncPath(): string {
	return GLOBAL_PATH();
}

export function projectPolicyPathForTests(cwd: string): string {
	return projectPath(cwd);
}

/** Project-local `.devopet/permissions.jsonc` for `cwd`. */
export function projectPermissionsJsoncPath(cwd: string): string {
	return projectPath(cwd);
}

/**
 * Append or replace a `toolPaths[toolName][globPattern]` rule and write the file.
 * Used when the user chooses “allow for this repository” / “allow globally” in the permission prompt.
 */
export function appendToolPathRule(
	scope: "global" | "project",
	cwd: string,
	toolName: string,
	globPattern: string,
	state: PermissionState,
): void {
	const filePath = scope === "global" ? globalPermissionsJsoncPath() : projectPermissionsJsoncPath(cwd);
	mkdirSync(dirname(filePath), { recursive: true });
	let yolo: boolean | undefined;
	let config: DevopetPermissionConfig;
	if (existsSync(filePath)) {
		const raw = readFileSync(filePath, "utf8");
		const doc = parsePolicyDocument(filePath, raw);
		config = { ...doc.config };
		yolo = doc.yolo;
	} else {
		config = { ...DEFAULT_ASK_POLICY };
		yolo = undefined;
	}
	if (!config.toolPaths) {
		config.toolPaths = {};
	}
	if (!config.toolPaths[toolName]) {
		config.toolPaths[toolName] = {};
	}
	config.toolPaths[toolName][globPattern] = state;
	const output: Record<string, unknown> = {
		...(yolo !== undefined ? { yolo } : {}),
		...config,
	};
	writeAtomic(filePath, `${JSON.stringify(output, null, 2)}\n`);
}
