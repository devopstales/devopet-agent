import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { tmpdir } from "node:os";
import {
  DEVOPET_CONFIG_HOME_ENV,
  findDevopetProjectConfigDir,
  getDevopetGlobalConfigDir,
} from "./devopet-config-paths.ts";

function withEnv<T>(key: string, value: string | undefined, fn: () => T): T {
  const prev = process.env[key];
  try {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
    return fn();
  } finally {
    if (prev === undefined) delete process.env[key];
    else process.env[key] = prev;
  }
}

describe("getDevopetGlobalConfigDir", () => {
  it("defaults to ~/.devopet (uses OS home)", () => {
    withEnv(DEVOPET_CONFIG_HOME_ENV, undefined, () => {
      assert.equal(getDevopetGlobalConfigDir(), join(homedir(), ".devopet"));
    });
  });

  it("honors absolute DEVOPET_CONFIG_HOME", () => {
    withEnv(DEVOPET_CONFIG_HOME_ENV, "/var/custom/devopet", () => {
      assert.equal(getDevopetGlobalConfigDir(), "/var/custom/devopet");
    });
  });

  it("expands DEVOPET_CONFIG_HOME ~ and ~/…", () => {
    withEnv(DEVOPET_CONFIG_HOME_ENV, "~", () => {
      assert.equal(getDevopetGlobalConfigDir(), homedir());
    });
    withEnv(DEVOPET_CONFIG_HOME_ENV, "~/alt-devopet", () => {
      assert.equal(getDevopetGlobalConfigDir(), join(homedir(), "alt-devopet"));
    });
  });
});

describe("findDevopetProjectConfigDir", () => {
  it("returns null when no .devopet directory exists upward", () => {
    const tmp = mkdtempSync(join(tmpdir(), "devopet-cfg-"));
    try {
      assert.equal(findDevopetProjectConfigDir(tmp), null);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("walks upward and returns the nearest .devopet directory", () => {
    const root = mkdtempSync(join(tmpdir(), "devopet-walk-"));
    const dotDevopet = join(root, ".devopet");
    const nested = join(root, "packages", "app", "src");
    try {
      mkdirSync(dotDevopet, { recursive: true });
      mkdirSync(nested, { recursive: true });
      assert.equal(findDevopetProjectConfigDir(nested), dotDevopet);
      assert.equal(findDevopetProjectConfigDir(root), dotDevopet);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("ignores a file named .devopet and keeps walking", () => {
    const root = mkdtempSync(join(tmpdir(), "devopet-file-"));
    const wrong = join(root, ".devopet");
    const parent = join(root, "parent");
    const real = join(parent, ".devopet");
    const cwd = join(parent, "child");
    try {
      writeFileSync(wrong, "");
      mkdirSync(parent, { recursive: true });
      mkdirSync(real, { recursive: true });
      assert.equal(findDevopetProjectConfigDir(cwd), real);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
