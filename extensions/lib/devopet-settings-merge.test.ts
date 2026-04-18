import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it, beforeEach, afterEach } from "node:test";

import {
  deepMergeSettings,
  loadMergedSettingsLayers,
  resolveDevopetSettingsPathArrays,
} from "./devopet-settings-merge.ts";

describe("devopet-settings-merge", () => {
  it("deepMergeSettings merges nested objects; later wins primitives", () => {
    const a = { x: 1, nested: { k: "a" } } as Record<string, unknown>;
    const b = { y: 2, nested: { k: "b" } };
    const m = deepMergeSettings(a, b);
    assert.equal(m.x, 1);
    assert.equal(m.y, 2);
    assert.equal((m.nested as { k: string }).k, "b");
  });

  it("loadMergedSettingsLayers applies pi global < pi project < devopet global < devopet project", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "devopet-set-"));
    const prevHome = process.env.HOME;
    const prevDevopet = process.env.DEVOPET_CONFIG_HOME;
    const prevPi = process.env.PI_CODING_AGENT_DIR;
    try {
      process.env.HOME = tmp;
      const agent = path.join(tmp, ".pi", "agent");
      const devG = path.join(tmp, ".devopet");
      process.env.PI_CODING_AGENT_DIR = agent;
      process.env.DEVOPET_CONFIG_HOME = devG;
      fs.mkdirSync(agent, { recursive: true });
      fs.mkdirSync(devG, { recursive: true });
      const proj = path.join(tmp, "prj");
      const dproj = path.join(proj, ".devopet");
      fs.mkdirSync(path.join(proj, ".pi"), { recursive: true });
      fs.mkdirSync(dproj, { recursive: true });

      fs.writeFileSync(path.join(agent, "settings.json"), JSON.stringify({ theme: "a", n: { x: 1 } }), "utf8");
      fs.writeFileSync(path.join(proj, ".pi", "settings.json"), JSON.stringify({ theme: "b", n: { x: 2 } }), "utf8");
      fs.writeFileSync(path.join(devG, "settings.json"), JSON.stringify({ theme: "c", n: { x: 3 } }), "utf8");
      fs.writeFileSync(path.join(dproj, "settings.json"), JSON.stringify({ theme: "d", n: { x: 4 } }), "utf8");

      const merged = loadMergedSettingsLayers(proj, agent) as { theme: string; n: { x: number } };
      assert.equal(merged.theme, "d");
      assert.equal(merged.n.x, 4);
    } finally {
      process.env.HOME = prevHome;
      process.env.DEVOPET_CONFIG_HOME = prevDevopet;
      process.env.PI_CODING_AGENT_DIR = prevPi;
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("resolveDevopetSettingsPathArrays resolves relative extensions against root", () => {
    const root = "/x/y/.devopet";
    const s = resolveDevopetSettingsPathArrays({ extensions: ["./ext/a", "~/z"] }, root) as {
      extensions: string[];
    };
    assert.equal(s.extensions[0], path.resolve(root, "ext/a"));
    assert.equal(s.extensions[1], "~/z");
  });
});
