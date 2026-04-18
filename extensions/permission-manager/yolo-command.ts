/**
 * `/yolo` — inspect and toggle `yolo` in `~/.devopet/permissions.jsonc` (permission bypass).
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
	DEFAULT_ASK_POLICY,
	globalPermissionsJsoncPath,
	projectPermissionsJsoncPath,
	resolveDevopetPermissionPolicy,
	stripJsonComments,
} from "./policy.ts";

const SUBS = ["status", "enable", "disable"] as const;

function usageLines(): string {
	return [
		"**Permission YOLO** — when `yolo: true`, the permission layer does not enforce allow/deny/ask.",
		"",
		"  `/yolo`              — show this help",
		"  `/yolo status`       — show global/project files and effective policy for this workspace",
		"  `/yolo enable`       — set `yolo: true` in `~/.devopet/permissions.jsonc`",
		"  `/yolo disable`      — set `yolo: false` in `~/.devopet/permissions.jsonc`",
		"",
		"After enable/disable, start a **new session** or run **`/reload`** so the permission extension reloads.",
	].join("\n");
}

function loadRoot(path: string): Record<string, unknown> {
	const raw = readFileSync(path, "utf8");
	return JSON.parse(stripJsonComments(raw)) as Record<string, unknown>;
}

function ensurePolicyShape(obj: Record<string, unknown>): void {
	if (obj.defaultPolicy === undefined || typeof obj.defaultPolicy !== "object" || obj.defaultPolicy === null) {
		obj.defaultPolicy = { ...DEFAULT_ASK_POLICY.defaultPolicy };
	}
	for (const k of ["tools", "bash", "mcp", "skills", "special"] as const) {
		if (obj[k] === undefined) {
			obj[k] = {};
		}
	}
}

function writeGlobal(path: string, obj: Record<string, unknown>): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(obj, null, 2)}\n`, "utf8");
}

function yoloFromRoot(obj: Record<string, unknown> | null): boolean | undefined {
	if (!obj || !("yolo" in obj)) {
		return undefined;
	}
	if (typeof obj.yolo !== "boolean") {
		return undefined;
	}
	return obj.yolo;
}

export function registerYoloCommand(pi: ExtensionAPI): void {
	pi.registerCommand("yolo", {
		description: "Permission YOLO: status | enable | disable (see ~/.devopet/permissions.jsonc)",
		getArgumentCompletions: (prefix: string) => {
			const parts = prefix.split(/\s+/);
			if (parts.length <= 1) {
				const p0 = parts[0] ?? "";
				const filtered = SUBS.filter((s) => s.startsWith(p0));
				return filtered.length > 0 ? filtered.map((s) => ({ value: s, label: s })) : null;
			}
			return null;
		},
		handler: async (args, ctx) => {
			const raw = (args ?? "").trim();
			if (!raw) {
				ctx.ui.notify(usageLines(), "info");
				return;
			}

			const parts = raw.split(/\s+/);
			const sub = parts[0]?.toLowerCase() ?? "";

			const globalPath = globalPermissionsJsoncPath();
			const cwd = ctx.cwd ?? process.cwd();
			const projPath = projectPermissionsJsoncPath(cwd);

			switch (sub) {
				case "status": {
					const lines: string[] = ["**Permission YOLO — status**", ""];

					if (existsSync(globalPath)) {
						try {
							const root = loadRoot(globalPath);
							const y = yoloFromRoot(root);
							const yStr = y === undefined ? "absent (treated as false)" : String(y);
							lines.push(`- Global \`~/.devopet/permissions.jsonc\`: \`yolo\` = ${yStr}`);
							lines.push(`  \`${globalPath}\``);
						} catch {
							lines.push(`- Global file: **parse error** — \`${globalPath}\``);
						}
					} else {
						lines.push("- Global `~/.devopet/permissions.jsonc`: **missing**");
					}

					if (existsSync(projPath)) {
						try {
							const root = loadRoot(projPath);
							const y = yoloFromRoot(root);
							const yStr = y === undefined ? "absent" : String(y);
							lines.push(`- Project \`.devopet/permissions.jsonc\`: \`yolo\` = ${yStr}`);
							lines.push(`  \`${projPath}\``);
						} catch {
							lines.push(`- Project file: **parse error** — \`${projPath}\``);
						}
					} else {
						lines.push("- Project `.devopet/permissions.jsonc`: **missing**");
					}

					const eff = resolveDevopetPermissionPolicy(cwd);
					lines.push("");
					if (eff.kind === "error") {
						lines.push(`**Effective (merged):** error — \`${eff.path}\`: ${eff.message}`);
					} else {
						lines.push(
							`**Effective (this workspace):** \`yolo: ${eff.yolo}\` · source \`${eff.source}\` · \`${eff.mergedPath}\``,
						);
					}

					pi.sendMessage({ customType: "view", content: lines.join("\n"), display: true });
					break;
				}

				case "enable": {
					try {
						let root: Record<string, unknown>;
						if (existsSync(globalPath)) {
							root = loadRoot(globalPath);
						} else {
							root = { ...DEFAULT_ASK_POLICY, yolo: true } as Record<string, unknown>;
						}
						ensurePolicyShape(root);
						root.yolo = true;
						writeGlobal(globalPath, root);
						ctx.ui.notify(
							`Set \`yolo: true\` in \`${globalPath}\`.\nStart a new session or /reload to apply.`,
							"info",
						);
					} catch (e) {
						const msg = e instanceof Error ? e.message : String(e);
						ctx.ui.notify(`Failed to update permissions: ${msg}`, "error");
					}
					break;
				}

				case "disable": {
					try {
						if (!existsSync(globalPath)) {
							ctx.ui.notify(
								`No global file at \`${globalPath}\`. Nothing to change (see /yolo status for effective policy).`,
								"info",
							);
							return;
						}
						const root = loadRoot(globalPath);
						ensurePolicyShape(root);
						root.yolo = false;
						writeGlobal(globalPath, root);
						ctx.ui.notify(
							`Set \`yolo: false\` in \`${globalPath}\`.\nStart a new session or /reload to apply.`,
							"info",
						);
					} catch (e) {
						const msg = e instanceof Error ? e.message : String(e);
						ctx.ui.notify(`Failed to update permissions: ${msg}`, "error");
					}
					break;
				}

				default:
					ctx.ui.notify(`Unknown subcommand: ${sub}\n\n${usageLines()}`, "warning");
			}
		},
	});
}
