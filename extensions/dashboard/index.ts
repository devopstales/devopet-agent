/**
 * dashboard — Unified live dashboard for Design Tree + OpenSpec + Cleave
 *
 * Renders a custom footer via setFooter() that supports modes:
 *   compact:  Dashboard summary + context gauge + original footer data
 *   raised:   Section details for design tree, openspec, cleave + footer data
 *   panel:    Non-capturing overlay (visible but doesn't steal input)
 *   focused:  Interactive overlay with keyboard navigation
 *
 * Toggle: ctrl+` or /dashboard command.
 * Cycle: compact → raised → panel → focused → compact
 *
 * Reads sharedState written by producer extensions (design-tree, openspec, cleave).
 * Subscribes to "dashboard:update" events for live re-rendering.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { OverlayHandle } from "@mariozechner/pi-tui";
import { basename } from "path";
import { DASHBOARD_UPDATE_EVENT } from "../lib/shared-state.ts";
import { getSharedBridge, buildSlashCommandResult } from "../lib/slash-command-bridge.ts";
import { DashboardFooter } from "./footer.ts";
import { DashboardOverlay, showDashboardOverlay } from "./overlay.ts";
import type { DashboardState, DashboardMode } from "./types.ts";
import type { CleaveState } from "./types.ts";
import { debug } from "../lib/debug.ts";
import { sciCall } from "../lib/sci-ui.ts";

/** Valid /dashboard subcommands for tab completion (legacy) */
const DASHBOARD_SUBCOMMANDS = ["compact", "raised", "panel", "focus", "open"];

/** Shorten a file path for display — keep last 2-3 segments. (absorbed from core-renderers.ts) */
function shortenPath(p: string | null | undefined, maxLen = 55): string {
	if (!p) return "…";
	if (p.length <= maxLen) return p;
	const parts = p.split("/");
	// Show last 3 segments at most
	const tail = parts.slice(-3).join("/");
	return tail.length <= maxLen ? tail : "…" + p.slice(-(maxLen - 1));
}

export default function (pi: ExtensionAPI) {
  // --- Terminal Title State (absorbed from terminal-title.ts) ---
  const project = basename(process.cwd());
  let titleCtx: ExtensionContext | null = null;
  let promptSnippet = "";
  let idle = true;
  let turnIndex = 0;
  let toolChain: string[] = [];
  let toolActive = false;
  let cleaveStatus: CleaveState["status"] = "idle";
  let cleaveDone = 0;
  let cleaveTotal = 0;

  // --- Dashboard State ---
  // --- Terminal Title Helpers (absorbed from terminal-title.ts) ---
  function truncate(text: string, max: number): string {
    const clean = text.split("\n")[0]!.trim().replace(/\s+/g, " ");
    if (clean.length <= max) return clean;
    return clean.slice(0, max).trimEnd() + "…";
  }

  /** Read cleave state from shared dashboard state (absorbed from terminal-title.ts) */
  function syncCleaveState(): void {
    const { sharedState } = require("../lib/shared-state.ts");
    const cleave = sharedState.cleave;
    if (cleave) {
      cleaveStatus = cleave.status;
      const children = cleave.children ?? [];
      cleaveTotal = children.length;
      cleaveDone = children.filter((c: any) => c.status === "done").length;
    } else {
      cleaveStatus = "idle";
      cleaveDone = 0;
      cleaveTotal = 0;
    }
  }

  /** Render terminal title (absorbed from terminal-title.ts) */
  function renderTitle() {
    if (!titleCtx?.ui?.setTitle) return;

    const parts: string[] = [`Ω ${project}`];

    // Cleave dispatch — takes priority when active
    const cleaveActive = cleaveStatus !== "idle" && cleaveStatus !== "done" && cleaveStatus !== "failed";
    if (cleaveActive) {
      if (cleaveStatus === "dispatching" || cleaveStatus === "merging") {
        parts.push(`⚡ cleave ${cleaveDone}/${cleaveTotal}`);
      } else {
        parts.push(`⚡ ${cleaveStatus}`);
      }
    } else if (cleaveStatus === "done") {
      parts.push("⚡ cleave ✓");
    } else if (cleaveStatus === "failed") {
      parts.push("⚡ cleave ✗");
    }

    // Tool execution
    if (toolActive && toolChain.length > 0) {
      const display = toolChain.slice(-2).join(" → ");
      parts.push(`⚙ ${display}`);
    }
    // Agent thinking (no active tool)
    else if (!idle && promptSnippet && !cleaveActive) {
      parts.push(`◆ ${promptSnippet}`);
    }

    // Turn counter when actively working (T2+)
    if (!idle && turnIndex >= 2) {
      parts.push(`T${turnIndex}`);
    }

    // Idle indicator
    if (idle) {
      parts.push("✦");
    }

    titleCtx.ui.setTitle(parts.join(" "));
  }

  /** Reset terminal title state (absorbed from terminal-title.ts) */
  function resetTitleState(c: ExtensionContext) {
    titleCtx = c;
    promptSnippet = "";
    toolChain = [];
    toolActive = false;
    idle = true;
    turnIndex = 0;
    cleaveStatus = "idle";
    cleaveDone = 0;
    cleaveTotal = 0;
    setTimeout(renderTitle, 50);
  }

  const state: DashboardState = {
    mode: "compact",
    turns: 0,
  };

  let footer: DashboardFooter | null = null;
  let tui: any = null; // TUI reference for requestRender
  let unsubscribeEvents: (() => void) | null = null;

  // ── Non-capturing overlay state ─────────────────────────────
  /** Overlay handle for non-capturing panel (visibility + focus control) */
  let overlayHandle: OverlayHandle | null = null;
  /** The done() callback to resolve the custom() promise on permanent close */
  let overlayDone: ((result: void) => void) | null = null;
  /** Whether the non-capturing overlay has been created this session */
  let overlayCreated = false;
  /** Whether focus should be applied once the handle arrives (handles async creation) */
  let pendingFocus = false;
  /** True while the agent is actively streaming — blocks focused overlay to prevent input lockup */
  let agentRunning = false;

  /**
   * Restore persisted dashboard mode from session entries.
   * Panel/focused modes restore to raised (overlay is session-transient).
   */
  function restoreMode(ctx: ExtensionContext): void {
    try {
      const entries = ctx.sessionManager.getEntries();
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i] as any;
        if (entry.type === "dashboard-state" && entry.data?.mode) {
          const saved = entry.data.mode as DashboardMode;
          // Overlay modes don't persist — fall back to raised
          state.mode = (saved === "panel" || saved === "focused") ? "raised" : saved;
          return;
        }
      }
    } catch { /* first session, no entries yet */ }
  }

  /**
   * Persist the current mode to the session.
   */
  function persistMode(_ctx: ExtensionContext): void {
    try {
      // Persist the base mode (panel/focused stored as raised)
      const persistable = (state.mode === "panel" || state.mode === "focused") ? "raised" : state.mode;
      pi.appendEntry("dashboard-state", { mode: persistable });
    } catch { /* session may not support it */ }
  }

  /**
   * Update footer context and trigger re-render.
   */
  function refresh(ctx: ExtensionContext): void {
    debug("dashboard", "refresh", {
      hasFooter: !!footer,
      hasTui: !!tui,
      footerType: footer?.constructor?.name,
    });
    if (footer) {
      footer.setContext(ctx);
    }
    tui?.requestRender();
  }

  /**
   * Show the non-capturing overlay panel.
   * Creates it on first call, then toggles visibility via setHidden.
   */
  function showPanel(ctx: ExtensionContext): void {
    if (overlayHandle && !overlayHandle.isHidden()) {
      // Already visible — nothing to do
      return;
    }

    if (overlayHandle) {
      // Was hidden — show it
      overlayHandle.setHidden(false);
      tui?.requestRender();
      return;
    }

    if (overlayCreated) {
      // Overlay was created but handle hasn't arrived yet (async), or
      // was permanently destroyed — don't recreate in same session
      return;
    }

    // Create the non-capturing overlay (fire-and-forget — don't await)
    overlayCreated = true;
    void ctx.ui.custom<void>(
      (tuiRef, theme, _kb, done) => {
        overlayDone = done;
        const overlay = new DashboardOverlay(tuiRef, theme, () => {
          // Esc → close the panel entirely
          hidePanel();
        });
        overlay.setEventBus(pi.events);
        return overlay;
      },
      {
        overlay: true,
        overlayOptions: {
          anchor: "right-center",
          width: "42%",
          minWidth: 42,
          maxHeight: "80%",
          margin: { top: 1, right: 1, bottom: 1 },
          visible: (termWidth: number) => termWidth >= 80,
          nonCapturing: true,
        },
        onHandle: (handle) => {
          overlayHandle = handle;
          // Apply deferred focus if cycleTo("focused") requested it before handle arrived
          if (pendingFocus) {
            pendingFocus = false;
            handle.focus();
          }
        },
      },
    );
  }

  /**
   * Hide the non-capturing overlay without destroying it.
   */
  function hidePanel(): void {
    pendingFocus = false;
    if (overlayHandle) {
      if (overlayHandle.isFocused()) {
        overlayHandle.unfocus();
      }
      overlayHandle.setHidden(true);
    }
    state.mode = "compact";
    tui?.requestRender();
  }

  /**
   * Focus the non-capturing overlay for interactive keyboard navigation.
   * Blocked while the agent is streaming — focusing during active output
   * causes the TUI input loop to deadlock with the render loop.
   */
  function focusPanel(): void {
    if (agentRunning) {
      // Can't safely capture input while agent is streaming — stay as panel
      state.mode = "panel";
      return;
    }
    if (overlayHandle && !overlayHandle.isHidden()) {
      overlayHandle.focus();
    } else {
      // Handle not yet available — defer until onHandle fires
      pendingFocus = true;
    }
  }

  /**
   * Cycle to a specific dashboard mode.
   */
  function cycleTo(ctx: ExtensionContext, targetMode: DashboardMode): void {
    state.mode = targetMode;

    switch (targetMode) {
      case "compact":
      case "raised":
        hidePanel();
        // hidePanel sets mode to "compact"; override for "raised"
        state.mode = targetMode;
        break;
      case "panel":
        pendingFocus = false;
        showPanel(ctx);
        break;
      case "focused":
        showPanel(ctx);
        focusPanel();
        break;
    }

    persistMode(ctx);
    tui?.requestRender();
  }

  /**
   * Toggle between compact and raised (2-state /dash toggle).
   * Panel modes are closed first and footer returns to compact.
   */
  function dashToggle(ctx: ExtensionContext): void {
    // If panel is open, close it first and go to compact
    if (state.mode === "panel" || state.mode === "focused") {
      hidePanel();
      return;
    }
    // 2-state toggle: compact ↔ raised
    const next = state.mode === "raised" ? "compact" : "raised";
    cycleTo(ctx, next);
  }

  /**
   * Toggle panel on/off. Panel and raised footer are mutually exclusive:
   * opening the panel collapses the footer to compact and focuses the overlay.
   */
  function panelToggle(ctx: ExtensionContext): void {
    if (state.mode === "panel" || state.mode === "focused") {
      hidePanel();
    } else {
      // Opening panel forces compact footer and focuses overlay for key input
      state.mode = "compact";
      cycleTo(ctx, "focused");
    }
  }

  // ── Session start: set up the custom footer and terminal title ──────────────────

  pi.on("session_start", async (_event, ctx) => {
    debug("dashboard", "session_start:enter", {
      hasUI: ctx.hasUI,
      cwd: ctx.cwd,
      hasSetFooter: typeof ctx.ui?.setFooter === "function",
    });
    if (!ctx.hasUI) {
      debug("dashboard", "session_start:bail", { reason: "no UI" });
      return;
    }

    state.turns = 0;
    overlayHandle = null;
    overlayDone = null;
    overlayCreated = false;
    pendingFocus = false;
    restoreMode(ctx);
    debug("dashboard", "session_start:mode", { mode: state.mode });

    // --- Terminal title reset (absorbed from terminal-title.ts) ---
    resetTitleState(ctx);

    // Set the custom footer
    try {
      ctx.ui.setFooter((tuiRef, theme, footerData) => {
        debug("dashboard", "footer:factory:enter", {
          hasTui: !!tuiRef,
          hasTheme: !!theme,
          hasFooterData: !!footerData,
          themeFgType: typeof theme?.fg,
        });
        try {
          tui = tuiRef;
          footer = new DashboardFooter(tuiRef, theme, footerData, state);
          footer.setContext(ctx);
          debug("dashboard", "footer:factory:ok", {
            footerType: footer?.constructor?.name,
            hasRender: typeof footer?.render === "function",
          });
          return footer;
        } catch (factoryErr: any) {
          debug("dashboard", "footer:factory:ERROR", {
            error: factoryErr?.message,
            stack: factoryErr?.stack?.split("\n").slice(0, 5).join(" | "),
          });
          throw factoryErr;
        }
      });
      debug("dashboard", "session_start:setFooter:ok");
    } catch (err: any) {
      debug("dashboard", "session_start:setFooter:ERROR", {
        error: err?.message,
        stack: err?.stack?.split("\n").slice(0, 5).join(" | "),
      });
    }

    // Subscribe to dashboard:update events from producer extensions.
    unsubscribeEvents = pi.events.on(DASHBOARD_UPDATE_EVENT, (data) => {
      debug("dashboard", "update-event", data as Record<string, unknown>);
      // Update terminal title state if cleave event
      const source = (data as Record<string, unknown>)?.source;
      if (source === "cleave") {
        syncCleaveState();
        renderTitle();
      }
      tui?.requestRender();
    });

    // Deferred initial render
    queueMicrotask(() => {
      debug("dashboard", "microtask:render", {
        tuiSet: !!tui,
        footerSet: !!footer,
        footerType: footer?.constructor?.name,
      });
      tui?.requestRender();
      renderTitle(); // Initial title render
    });

    // Non-blocking capability health check — probes devopet's own runtime deps
    // (ollama, d2, pandoc, etc.) using the bootstrap DEPS registry.
    // This is NOT a project linter — it tells the user which devopet features
    // won't work in the current environment.
    setTimeout(async () => {
      try {
        const { DEPS } = await import("../bootstrap/deps.ts");
        // Probe runtime deps only — skip install-time bootstrapping tools (nix)
        // that devopet doesn't call directly at runtime.
        const INSTALL_ONLY = new Set(["nix"]);
        const probed = DEPS.filter(d => (d.tier === "core" || d.tier === "recommended") && !INSTALL_ONLY.has(d.id));
        const missing = probed.filter(d => !d.check());
        if (missing.length === 0) return;

        const summary = missing.map(d => d.name).join(", ");
        const details = missing.map(d => `• ${d.name} — ${d.purpose}`).join("\n");
        ctx.ui.notify(`Missing devopet deps: ${summary}`, "info");
        pi.sendMessage({
          customType: "guardrail-health-check",
          content: `[devopet startup check] Missing runtime dependencies: ${summary}.\n\n`
            + `These devopet features may not work:\n${details}\n\n`
            + `Run \`/bootstrap\` to install interactively.`,
          display: true,
        });
      } catch {
        /* non-fatal */
      }
    }, 2000);
  });

  // ── Session shutdown: cleanup ─────────────────────────────────

  pi.on("session_shutdown", async () => {
    if (unsubscribeEvents) {
      unsubscribeEvents();
      unsubscribeEvents = null;
    }
    // Permanently close the non-capturing overlay
    if (overlayHandle) {
      overlayHandle.hide();
      overlayHandle = null;
    }
    if (overlayDone) {
      overlayDone();
      overlayDone = null;
    }
    overlayCreated = false;
    pendingFocus = false;
    footer = null;
    tui = null;
  });

  // ── Session lifecycle for terminal title (absorbed from terminal-title.ts) ───
  pi.on("session_switch", (_e, c) => resetTitleState(c));
  pi.on("session_fork", (_e, c) => resetTitleState(c));

  // ── Agent lifecycle for terminal title (absorbed from terminal-title.ts) ────
  pi.on("before_agent_start", (event) => {
    if (event.prompt) {
      promptSnippet = truncate(event.prompt, 30);
    }
    agentRunning = true;
    // If focus was pending and agent starts before handle arrived, cancel it
    pendingFocus = false;
    // If overlay is currently focused, unfocus to avoid input deadlock
    if (overlayHandle?.isFocused()) {
      overlayHandle.unfocus();
      state.mode = "panel";
    }
  });

  pi.on("agent_start", (_e, c) => {
    titleCtx = c;
    idle = false;
    toolChain = [];
    toolActive = false;
    renderTitle();
  });

  pi.on("turn_start", (event) => {
    turnIndex = event.turnIndex;
    renderTitle();
  });

  pi.on("tool_execution_start", (event) => {
    // Deduplicate consecutive same-tool calls
    if (toolChain[toolChain.length - 1] !== event.toolName) {
      toolChain.push(event.toolName);
    }
    toolActive = true;
    renderTitle();
  });

  // ── Events that trigger re-render ─────────────────────────────

  pi.on("turn_end", async (_event, ctx) => {
    agentRunning = false;
    state.turns++;
    refresh(ctx);
  });

  pi.on("message_end", async (_event, ctx) => {
    refresh(ctx);
  });

  pi.on("tool_execution_end", async (_event, ctx) => {
    toolActive = false;
    renderTitle();
    refresh(ctx);
  });

  pi.on("agent_end", (_e, c) => {
    titleCtx = c;
    idle = true;
    toolChain = [];
    toolActive = false;
    renderTitle();
  });

  // ── Session compaction for terminal title (absorbed from terminal-title.ts) ─
  pi.on("session_compact", () => {
    // Brief flash during compaction
    const prev = promptSnippet;
    promptSnippet = "compacting…";
    renderTitle();
    setTimeout(() => {
      promptSnippet = prev;
      renderTitle();
    }, 2000);
  });

  // ── Core Tool Renderers (absorbed from core-renderers.ts) ───────────
  // Uses registerToolRenderer() to attach renderCall/renderResult
  // to tools that have no built-in rendering in pi-mono.

  // registerToolRenderer was added in pi-mono 0965ae87 — gracefully skip
  // if the published pi version doesn't have it yet.
  if (typeof (pi as any).registerToolRenderer === "function") {

    // ── View ──────────────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("view", {
      renderCall(args: any, theme: any) {
        const p = shortenPath(args?.path);
        const page = args?.page ? ` p${args.page}` : "";
        return sciCall("view", `${p}${page}`, theme);
      },
    });

    // ── Web Search ────────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("web_search", {
      renderCall(args: any, theme: any) {
        const query = args?.query ?? "";
        const mode = args?.mode ?? "quick";
        const display = query.length > 55 ? query.slice(0, 52) + "…" : query;
        const modeTag = mode !== "quick" ? ` [${mode}]` : "";
        return sciCall("web_search", `${display}${modeTag}`, theme);
      },
    });

    // ── Chronos ───────────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("chronos", {
      renderCall(args: any, theme: any) {
        const sub = args?.subcommand ?? "week";
        const expr = args?.expression ? ` "${args.expression}"` : "";
        return sciCall("chronos", `${sub}${expr}`, theme);
      },
    });

    // ── Render Diagram (D2) ───────────────────────────────────────────────
    (pi as any).registerToolRenderer("render_diagram", {
      renderCall(args: any, theme: any) {
        const title = args?.title ?? "diagram";
        return sciCall("render_diagram", title, theme);
      },
    });

    // ── Render Native Diagram ─────────────────────────────────────────────
    (pi as any).registerToolRenderer("render_native_diagram", {
      renderCall(args: any, theme: any) {
        const title = args?.title ?? "diagram";
        return sciCall("render_native_diagram", title, theme);
      },
    });

    // ── Render Excalidraw ─────────────────────────────────────────────────
    (pi as any).registerToolRenderer("render_excalidraw", {
      renderCall(args: any, theme: any) {
        const p = shortenPath(args?.path);
        return sciCall("render_excalidraw", p, theme);
      },
    });

    // ── Generate Image Local ──────────────────────────────────────────────
    (pi as any).registerToolRenderer("generate_image_local", {
      renderCall(args: any, theme: any) {
        const prompt = args?.prompt ?? "";
        const preset = args?.preset ?? "schnell";
        const display = prompt.length > 50 ? prompt.slice(0, 47) + "…" : prompt;
        return sciCall("generate_image_local", `${display} [${preset}]`, theme);
      },
    });

    // ── Render Composition Still ──────────────────────────────────────────
    (pi as any).registerToolRenderer("render_composition_still", {
      renderCall(args: any, theme: any) {
        const p = shortenPath(args?.composition_path);
        const frame = args?.frame != null ? ` f${args.frame}` : "";
        return sciCall("render_composition_still", `${p}${frame}`, theme);
      },
    });

    // ── Render Composition Video ──────────────────────────────────────────
    (pi as any).registerToolRenderer("render_composition_video", {
      renderCall(args: any, theme: any) {
        const p = shortenPath(args?.composition_path);
        const frames = args?.duration_in_frames ?? "?";
        const fmt = args?.format ?? "gif";
        return sciCall("render_composition_video", `${p} (${frames}f, ${fmt})`, theme);
      },
    });

    // ── Model Tier ────────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("set_model_tier", {
      renderCall(args: any, theme: any) {
        const tier = args?.tier ?? "?";
        return sciCall("set_model_tier", `→ ${tier}`, theme);
      },
    });

    // ── Thinking Level ────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("set_thinking_level", {
      renderCall(args: any, theme: any) {
        const level = args?.level ?? "?";
        return sciCall("set_thinking_level", `→ ${level}`, theme);
      },
    });

    // ── Ask Local Model ───────────────────────────────────────────────────
    (pi as any).registerToolRenderer("ask_local_model", {
      renderCall(args: any, theme: any) {
        const model = args?.model ?? "auto";
        const prompt = args?.prompt ?? "";
        const display = prompt.length > 45 ? prompt.slice(0, 42) + "…" : prompt;
        return sciCall("ask_local_model", `[${model}] ${display}`, theme);
      },
    });

    // ── Manage Ollama ─────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("manage_ollama", {
      renderCall(args: any, theme: any) {
        const action = args?.action ?? "?";
        const model = args?.model ? ` ${args.model}` : "";
        return sciCall("manage_ollama", `${action}${model}`, theme);
      },
    });

    // ── List Local Models ─────────────────────────────────────────────────
    (pi as any).registerToolRenderer("list_local_models", {
      renderCall(_args: any, theme: any) {
        return sciCall("list_local_models", "inventory", theme);
      },
    });

    // ── Switch Offline Driver ─────────────────────────────────────────────
    (pi as any).registerToolRenderer("switch_to_offline_driver", {
      renderCall(args: any, theme: any) {
        const reason = args?.reason ?? "";
        const display = reason.length > 50 ? reason.slice(0, 47) + "…" : reason;
        return sciCall("switch_to_offline_driver", display, theme);
      },
    });

    // ── Manage Tools ──────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("manage_tools", {
      renderCall(args: any, theme: any) {
        const action = args?.action ?? "list";
        const tools = args?.tools?.join(", ") ?? "";
        const profile = args?.profile ?? "";
        const detail = tools || profile || "";
        return sciCall("manage_tools", `${action}${detail ? ` ${detail}` : ""}`, theme);
      },
    });

    // ── Whoami ────────────────────────────────────────────────────────────
    (pi as any).registerToolRenderer("whoami", {
      renderCall(_args: any, theme: any) {
        return sciCall("whoami", "check auth", theme);
      },
    });
  }

  // ── Keyboard shortcut: ctrl+` ────────────────────────────────
  // Cycles through: compact → raised → panel → focused → compact

  pi.registerShortcut("ctrl+`", {
    description: "Toggle dashboard footer (compact ↔ raised)",
    handler: (ctx) => {
      dashToggle(ctx);
    },
  });

  // ── Slash commands: /dash and /dashboard ─────────────────────
  // Registered with the shared bridge as interactive-only (agentCallable: false)
  // so the agent gets a structured refusal instead of an opaque "not registered" error.

  const bridge = getSharedBridge();

  bridge.register(pi, {
    name: "dash",
    description: "Toggle dashboard footer: compact ↔ raised. /dashboard opens the side panel.",
    bridge: {
      agentCallable: false,
      sideEffectClass: "read",
      summary: "Interactive-only dashboard footer toggle",
    },
    structuredExecutor: async (_args, ctx) => {
      dashToggle(ctx as ExtensionContext);
      const label = state.mode === "raised" ? "raised" : "compact";
      return buildSlashCommandResult("dash", [], {
        ok: true,
        summary: `Dashboard: ${label}`,
        humanText: `Dashboard: ${label}`,
        effects: { sideEffectClass: "read" },
      });
    },
  });

  bridge.register(pi, {
    name: "dashboard",
    description: "Toggle dashboard side panel (open/close). Use /dash to raise/lower the footer.",
    getArgumentCompletions: (prefix) => {
      const lower = (prefix ?? "").toLowerCase();
      return DASHBOARD_SUBCOMMANDS
        .filter(s => s.startsWith(lower))
        .map(s => ({ label: s, value: s }));
    },
    bridge: {
      agentCallable: false,
      sideEffectClass: "read",
      summary: "Interactive-only dashboard panel toggle",
    },
    structuredExecutor: async (args, ctx) => {
      const arg = (args ?? "").trim().toLowerCase();
      const extCtx = ctx as ExtensionContext;

      if (arg === "open") {
        state.mode = "raised";
        persistMode(extCtx);
        tui?.requestRender();
        await showDashboardOverlay(extCtx, pi);
        return buildSlashCommandResult("dashboard", [arg], {
          ok: true,
          summary: "Dashboard: raised + panel",
          humanText: "Dashboard: raised + panel",
          effects: { sideEffectClass: "read" },
        });
      }
      if (arg === "compact") { cycleTo(extCtx, "compact"); return buildSlashCommandResult("dashboard", [arg], { ok: true, summary: "Dashboard: compact", humanText: "Dashboard: compact", effects: { sideEffectClass: "read" } }); }
      if (arg === "raised")  { cycleTo(extCtx, "raised");  return buildSlashCommandResult("dashboard", [arg], { ok: true, summary: "Dashboard: raised", humanText: "Dashboard: raised", effects: { sideEffectClass: "read" } }); }
      if (arg === "panel")   { cycleTo(extCtx, "panel");   return buildSlashCommandResult("dashboard", [arg], { ok: true, summary: "Dashboard: panel", humanText: "Dashboard: panel", effects: { sideEffectClass: "read" } }); }
      if (arg === "focus")   { cycleTo(extCtx, "focused"); return buildSlashCommandResult("dashboard", [arg], { ok: true, summary: "Dashboard: focused", humanText: "Dashboard: focused", effects: { sideEffectClass: "read" } }); }

      // Default: open blocking full-page operator panel
      await showDashboardOverlay(extCtx, pi);
      return buildSlashCommandResult("dashboard", [], {
        ok: true,
        summary: "Dashboard: closed",
        humanText: "Dashboard: closed",
        effects: { sideEffectClass: "read" },
      });
    },
    interactiveHandler: async (result) => {
      // The structuredExecutor already performs the toggle; just suppress double notification
      // since dashToggle/cycleTo/panelToggle already update visual state.
    },
  });
}
