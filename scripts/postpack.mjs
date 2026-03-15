/**
 * postpack.mjs — Restore @styrene-lab/* symlinks after `npm pack`
 *
 * Runs automatically after `npm pack` / `npm publish`.
 * Counterpart: prepack.mjs materializes symlinks before packing.
 */

import {
	readFileSync,
	rmSync,
	symlinkSync,
	lstatSync,
	mkdirSync,
} from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const bundled = pkg.bundleDependencies || [];

for (const name of bundled) {
	const ref = pkg.dependencies[name];
	if (!ref || !ref.startsWith("file:")) continue;

	const nmDir = join(root, "node_modules", ...name.split("/"));
	const targetAbs = resolve(root, ref.slice(5));
	const linkParent = dirname(nmDir);
	const target = relative(linkParent, targetAbs);

	// Skip if already a symlink (idempotent)
	try {
		if (lstatSync(nmDir).isSymbolicLink()) {
			console.log(`  ${name} already a symlink, skipping`);
			continue;
		}
	} catch {
		// doesn't exist, will create
	}

	// 1. Remove materialized directory
	rmSync(nmDir, { recursive: true, force: true });

	// 2. Re-create relative symlink
	mkdirSync(linkParent, { recursive: true });
	symlinkSync(target, nmDir);
	console.log(`  restored ${name} → ${target}`);
}

console.log(
	`postpack: restored ${bundled.length} @styrene-lab symlinks`,
);
