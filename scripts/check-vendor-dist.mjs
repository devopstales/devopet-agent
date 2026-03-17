/**
 * check-vendor-dist.mjs — Verify that vendor/pi-mono dist/ directories
 * exist and contain compiled output.
 *
 * This is an existence guard, not a freshness check. Freshness is guaranteed
 * by the CI build step running `npm run build` on every publish invocation.
 *
 * Run after `npm run build` in vendor/pi-mono and before `npm publish`.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const bundled = pkg.bundleDependencies || [];

let failed = false;

for (const name of bundled) {
	const ref = pkg.dependencies[name];
	if (!ref?.startsWith("file:")) continue;

	const srcDir = resolve(root, ref.slice(5));
	const distDir = resolve(srcDir, "dist");

	if (!existsSync(distDir)) {
		console.error(`✗ ${name}: dist/ directory missing at ${distDir}`);
		failed = true;
		continue;
	}

	// Spot-check: the dist should have .js files
	const hasJs = readdirSync(distDir).some((e) => e.endsWith(".js"));
	if (!hasJs) {
		console.error(`✗ ${name}: dist/ exists but contains no .js files`);
		failed = true;
		continue;
	}

	console.log(`✓ ${name}: dist/ present`);
}

if (failed) {
	console.error(
		"\nFATAL: Vendor dist directories are missing or empty. Run `cd vendor/pi-mono && npm run build` first.",
	);
	process.exit(1);
}

console.log("\nAll vendor dist directories verified.");
