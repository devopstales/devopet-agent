import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface PiPackageJson {
  pi?: {
    extensions?: string[];
  };
}

describe("startup extension order", () => {
  it("inference extension is registered (consolidates offline-driver, effort, model-budget, local-inference)", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(here, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as PiPackageJson;
    const extensions = pkg.pi?.extensions ?? [];
    const inferenceIndex = extensions.indexOf("./extensions/inference");

    assert.notEqual(inferenceIndex, -1, "inference extension must be registered");
  });

  it("consolidated extensions are no longer individually registered", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(here, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as PiPackageJson;
    const extensions = pkg.pi?.extensions ?? [];

    const removed = [
      "./extensions/offline-driver.ts",
      "./extensions/effort",
      "./extensions/model-budget.ts",
      "./extensions/local-inference",
      "./extensions/spinner-verbs.ts",
      "./extensions/sermon-widget.ts",
      "./extensions/auto-compact.ts",
      "./extensions/session-log.ts",
      "./extensions/version-check.ts",
      "./extensions/terminal-title.ts",
      "./extensions/core-renderers.ts",
    ];
    for (const ext of removed) {
      assert.equal(extensions.indexOf(ext), -1, `${ext} should no longer be individually registered`);
    }
  });
});
