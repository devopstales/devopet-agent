import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it, beforeEach, afterEach } from "node:test";

import {
  collectAppendSegments,
  composeMergedSystemReplaceContent,
  findAncestorPiConfigDir,
  needsCustomSystemPromptComposition,
} from "./system-prompt-md.ts";

describe("system-prompt-md", () => {
  let tmp: string;
  let prevHome: string | undefined;
  let prevDevopet: string | undefined;
  let prevPiAgent: string | undefined;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "devopet-sp-"));
    prevHome = process.env.HOME;
    prevDevopet = process.env.DEVOPET_CONFIG_HOME;
    prevPiAgent = process.env.PI_CODING_AGENT_DIR;
    process.env.HOME = tmp;
    process.env.DEVOPET_CONFIG_HOME = path.join(tmp, ".devopet");
    process.env.PI_CODING_AGENT_DIR = path.join(tmp, ".pi", "agent");
    fs.mkdirSync(process.env.PI_CODING_AGENT_DIR, { recursive: true });
    fs.mkdirSync(process.env.DEVOPET_CONFIG_HOME, { recursive: true });
  });

  afterEach(() => {
    process.env.HOME = prevHome;
    process.env.DEVOPET_CONFIG_HOME = prevDevopet;
    process.env.PI_CODING_AGENT_DIR = prevPiAgent;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("composeMergedSystemReplaceContent orders project devopet, global devopet, then AGENTS after bundled", () => {
    const proj = path.join(tmp, "repo");
    const dd = path.join(proj, ".devopet");
    fs.mkdirSync(dd, { recursive: true });
    fs.writeFileSync(path.join(dd, "SYSTEM.md"), "MARK_PROJ_SYS\n", "utf8");
    fs.writeFileSync(path.join(process.env.DEVOPET_CONFIG_HOME!, "SYSTEM.md"), "MARK_GLOBAL\n", "utf8");
    fs.writeFileSync(path.join(proj, "AGENTS.md"), "MARK_AGENTS\n", "utf8");

    const merged = composeMergedSystemReplaceContent(proj);
    assert.ok(merged);
    const iBundled = merged.indexOf("# System instructions (devopet)");
    const iP = merged.indexOf("MARK_PROJ_SYS");
    const iG = merged.indexOf("MARK_GLOBAL");
    const iA = merged.indexOf("MARK_AGENTS");
    assert.ok(iBundled >= 0 && iP >= 0 && iG >= 0 && iA >= 0);
    assert.ok(iBundled < iP && iP < iG && iG < iA);
  });

  it("collectAppendSegments concatenates global pi then project pi then devopet", () => {
    const proj = path.join(tmp, "walk");
    const piDir = path.join(proj, ".pi");
    fs.mkdirSync(piDir, { recursive: true });
    fs.writeFileSync(path.join(process.env.PI_CODING_AGENT_DIR!, "APPEND_SYSTEM.md"), "g", "utf8");
    fs.writeFileSync(path.join(piDir, "APPEND_SYSTEM.md"), "p", "utf8");
    fs.writeFileSync(path.join(process.env.DEVOPET_CONFIG_HOME!, "APPEND_SYSTEM.md"), "dg", "utf8");
    const dproj = path.join(proj, ".devopet");
    fs.mkdirSync(dproj, { recursive: true });
    fs.writeFileSync(path.join(dproj, "APPEND_SYSTEM.md"), "dp", "utf8");

    const segs = collectAppendSegments(proj);
    assert.deepEqual(segs, ["g", "p", "dg", "dp"]);
  });

  it("needsCustomSystemPromptComposition is true when both pi append files exist", () => {
    const proj = path.join(tmp, "both");
    const piLocal = path.join(proj, ".pi");
    fs.mkdirSync(piLocal, { recursive: true });
    fs.writeFileSync(path.join(process.env.PI_CODING_AGENT_DIR!, "APPEND_SYSTEM.md"), "a", "utf8");
    fs.writeFileSync(path.join(piLocal, "APPEND_SYSTEM.md"), "b", "utf8");

    assert.equal(needsCustomSystemPromptComposition(proj), true);
  });

  it("findAncestorPiConfigDir walks upward", () => {
    const base = path.join(tmp, "monorepo");
    const root = path.join(base, "pkg", "sub");
    fs.mkdirSync(path.join(base, ".pi"), { recursive: true });
    fs.mkdirSync(root, { recursive: true });
    const found = findAncestorPiConfigDir(root);
    assert.ok(found);
    assert.ok(found.endsWith(".pi"));
  });
});
