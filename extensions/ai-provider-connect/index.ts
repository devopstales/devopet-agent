/**
 * **`/connect`** / **`/disconnect`** — provider OAuth and API keys.
 *
 * Product: **first-party** devopet extension; **behavior** aligns with **[pi-connect](https://www.npmjs.com/package/pi-connect)** (reference). See **`openspec/changes/ai-provider-extensions`** (`connect-command-integration`).
 * Must run **before** `security-engine` (permissions + guard) so auth surfaces are registered first.
 *
 * **Implementation note:** may temporarily delegate via explicit import from `node_modules/pi-connect/index.ts` until fully in-tree; spec targets removing that shim.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const devopetRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const piConnectEntry = join(devopetRoot, "node_modules/pi-connect/index.ts");

export default async function aiProviderConnect(pi: ExtensionAPI): Promise<void> {
	const mod = await import(pathToFileURL(piConnectEntry).href);
	(mod.default as (p: ExtensionAPI) => void)(pi);
}
