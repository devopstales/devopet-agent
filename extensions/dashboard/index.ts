/**
 * dashboard — Unified live dashboard for Design Tree + OpenSpec + Cleave
 *
 * Renders a custom footer via setFooter() that supports two modes:
 *   Layer 0 (compact): Dashboard summary + context gauge + original footer data
 *   Layer 1 (raised):  Section details for design tree, openspec, cleave + footer data
 *
 * Reads sharedState written by producer extensions (design-tree, openspec, cleave).
 * Subscribes to "dashboard:update" events for live re-rendering.
 *
 * Absorbs status-bar.ts — the context gauge (turn counter + memory bar + %)
 * is rendered directly in the compact footer line.
 *
 * Toggle: Ctrl+Shift+D or /dashboard command.
 * Persistence: raised/lowered state saved via appendEntry("dashboard-state").
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { DASHBOARD_UPDATE_EVENT } from "../shared-state.ts";
import { DashboardFooter } from "./footer.ts";
import type { DashboardState, DashboardMode } from "./types.ts";

export default function (pi: ExtensionAPI) {
  const state: DashboardState = {
    mode: "compact",
    turns: 0,
  };

  let footer: DashboardFooter | null = null;
  let tui: any = null; // TUI reference for requestRender
  let unsubscribeEvents: (() => void) | null = null;

  /**
   * Restore persisted dashboard mode from session entries.
   */
  function restoreMode(ctx: ExtensionContext): void {
    try {
      const entries = ctx.sessionManager.getEntries();
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i] as any;
        if (entry.type === "dashboard-state" && entry.data?.mode) {
          state.mode = entry.data.mode as DashboardMode;
          return;
        }
      }
    } catch { /* first session, no entries yet */ }
  }

  /**
   * Persist the current mode to the session.
   */
  function persistMode(ctx: ExtensionContext): void {
    try {
      ctx.appendEntry("dashboard-state", { mode: state.mode });
    } catch { /* session may not support it */ }
  }

  /**
   * Toggle between compact and raised modes.
   */
  function toggle(ctx: ExtensionContext): void {
    state.mode = state.mode === "compact" ? "raised" : "compact";
    persistMode(ctx);
    tui?.requestRender();
  }

  /**
   * Update footer context and trigger re-render.
   */
  function refresh(ctx: ExtensionContext): void {
    if (footer) {
      footer.setContext(ctx);
    }
    tui?.requestRender();
  }

  // ── Session start: set up the custom footer ──────────────────

  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) return;

    state.turns = 0;
    restoreMode(ctx);

    // Set the custom footer
    ctx.ui.setFooter((tuiRef, theme, footerData) => {
      tui = tuiRef;
      footer = new DashboardFooter(tuiRef, theme, footerData, state);
      footer.setContext(ctx);
      return footer;
    });

    // Subscribe to dashboard:update events from producer extensions
    unsubscribeEvents = pi.events.on(DASHBOARD_UPDATE_EVENT, () => {
      tui?.requestRender();
    });
  });

  // ── Session shutdown: cleanup ─────────────────────────────────

  pi.on("session_shutdown", async () => {
    if (unsubscribeEvents) {
      unsubscribeEvents();
      unsubscribeEvents = null;
    }
    footer = null;
    tui = null;
  });

  // ── Events that trigger re-render ─────────────────────────────

  pi.on("turn_end", async (_event, ctx) => {
    state.turns++;
    refresh(ctx);
  });

  pi.on("message_end", async (_event, ctx) => {
    refresh(ctx);
  });

  pi.on("tool_execution_end", async (_event, ctx) => {
    refresh(ctx);
  });

  // ── Keyboard shortcut: Ctrl+Shift+D ──────────────────────────

  pi.registerShortcut("ctrl+shift+d", {
    description: "Toggle dashboard (compact/raised)",
    handler: (ctx) => {
      toggle(ctx);
    },
  });

  // ── Slash command: /dashboard ─────────────────────────────────

  pi.registerCommand("dashboard", {
    description: "Toggle dashboard view (compact ↔ raised)",
    handler: async (_args, ctx) => {
      toggle(ctx);
      const modeLabel = state.mode === "raised" ? "raised" : "compact";
      ctx.ui.notify(`Dashboard: ${modeLabel}`, "info");
    },
  });
}
