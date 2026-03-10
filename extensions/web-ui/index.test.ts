import assert from "node:assert/strict";
import { before, beforeEach, afterEach, describe, it } from "node:test";
import { startWebUIServer, type WebUIServer } from "./server.ts";
import { _setServer, _setExecFn } from "./index.ts";

function buildFakePi() {
  const commands = new Map<string, { handler: (args: string, ctx: any) => Promise<void> }>();
  const events = new Map<string, Array<() => Promise<void>>>();
  return {
    registerCommand(name: string, config: { handler: (args: string, ctx: any) => Promise<void> }) {
      commands.set(name, config);
    },
    on(event: string, handler: () => Promise<void>) {
      const list = events.get(event) ?? [];
      list.push(handler);
      events.set(event, list);
    },
    _commands: commands,
    async _trigger(event: string) {
      for (const handler of events.get(event) ?? []) await handler();
    },
  };
}

async function runCommand(api: ReturnType<typeof buildFakePi>, args: string): Promise<string[]> {
  const command = api._commands.get("web-ui");
  assert.ok(command, "web-ui command should be registered");
  const messages: string[] = [];
  await command.handler(args, { cwd: process.cwd(), ui: { notify: (msg: string) => messages.push(msg) } });
  return messages;
}

let register: (pi: ReturnType<typeof buildFakePi>) => void;

before(async () => {
  const mod = await import("./index.ts");
  register = mod.default as unknown as typeof register;
});

describe("web-ui command surface", () => {
  let api: ReturnType<typeof buildFakePi>;
  let realServer: WebUIServer | null = null;

  beforeEach(() => {
    _setServer(null);
    api = buildFakePi();
    register(api as any);
  });

  afterEach(async () => {
    if (realServer) {
      await realServer.stop().catch(() => {});
      realServer = null;
    }
    _setServer(null);
  });

  it("reports stopped status before start", async () => {
    const messages = await runCommand(api, "status");
    assert.equal(messages.length, 1);
    assert.match(messages[0], /stopped/i);
  });

  it("starts server and reports URL", async () => {
    const messages = await runCommand(api, "start");
    assert.equal(messages.length, 1);
    assert.match(messages[0], /started/i);
    assert.match(messages[0], /127\.0\.0\.1/);
    const mod = await import("./index.ts");
    realServer = mod._server;
    assert.ok(realServer);
  });

  it("opens browser when server is running", async () => {
    realServer = await startWebUIServer();
    _setServer(realServer);
    let captured: string | null = null;
    const prev = _setExecFn(((cmd: string, cb: (err: Error | null) => void) => {
      captured = cmd;
      cb(null);
      return {} as any;
    }) as any);
    try {
      const messages = await runCommand(api, "open");
      assert.equal(messages.length, 1);
      assert.match(messages[0], /Opening/);
      assert.notEqual(captured, null);
      assert.match(String(captured), /127\.0\.0\.1/);
    } finally {
      _setExecFn(prev);
    }
  });

  it("stops server gracefully on session shutdown", async () => {
    realServer = await startWebUIServer();
    _setServer(realServer);
    await api._trigger("session_shutdown");
    const mod = await import("./index.ts");
    assert.equal(mod._server, null);
    realServer = null;
  });
});
