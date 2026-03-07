/**
 * Custom footer component for the unified dashboard.
 *
 * Implements two rendering modes:
 *   Layer 0 (compact): 3 lines — dashboard summary + original footer data
 *   Layer 1 (raised):  up to 10 lines — section details + original footer data
 *
 * Reads sharedState for design-tree, openspec, and cleave data.
 * Reads footerData for git branch, extension statuses, provider count.
 * Reads ExtensionContext for token stats, model, context usage.
 */

import type { Component } from "@mariozechner/pi-tui";
import type { Theme } from "@mariozechner/pi-coding-agent";
import type { ReadonlyFooterDataProvider } from "@mariozechner/pi-coding-agent";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { TUI } from "@mariozechner/pi-tui";
import type { DashboardState } from "./types.ts";
import { sharedState } from "../shared-state.ts";

/**
 * Format token counts to compact display (e.g. 1.2k, 45k, 1.3M)
 */
function formatTokens(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.round(count / 1000)}k`;
  if (count < 10000000) return `${(count / 1000000).toFixed(1)}M`;
  return `${Math.round(count / 1000000)}M`;
}

/**
 * Truncate a string to fit within a given visible width.
 * Simple implementation that respects ANSI escape codes.
 */
function truncatePlain(text: string, maxWidth: number, suffix = "..."): string {
  // Strip ANSI for width measurement
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, "");
  if (stripped.length <= maxWidth) return text;
  // Naive truncation — works for non-styled strings
  return stripped.slice(0, maxWidth - suffix.length) + suffix;
}

/**
 * Sanitize text for display in a single-line status.
 */
function sanitizeStatusText(text: string): string {
  return text
    .replace(/[\r\n\t]/g, " ")
    .replace(/ +/g, " ")
    .trim();
}

export class DashboardFooter implements Component {
  private tui: TUI;
  private theme: Theme;
  private footerData: ReadonlyFooterDataProvider;
  private dashState: DashboardState;
  private ctxRef: ExtensionContext | null = null;

  constructor(
    tui: TUI,
    theme: Theme,
    footerData: ReadonlyFooterDataProvider,
    dashState: DashboardState,
  ) {
    this.tui = tui;
    this.theme = theme;
    this.footerData = footerData;
    this.dashState = dashState;
  }

  /** Update the extension context reference (called on each event) */
  setContext(ctx: ExtensionContext): void {
    this.ctxRef = ctx;
  }

  /** No-op — theme is passed by reference */
  invalidate(): void {}

  dispose(): void {
    this.ctxRef = null;
  }

  render(width: number): string[] {
    if (this.dashState.mode === "raised") {
      return this.renderRaised(width);
    }
    return this.renderCompact(width);
  }

  // ── Compact Mode (Layer 0) ────────────────────────────────────

  private renderCompact(width: number): string[] {
    const theme = this.theme;
    const lines: string[] = [];

    // Line 1: Dashboard summary + context gauge
    const dashParts: string[] = [];

    // Design tree summary
    const dt = sharedState.designTree;
    if (dt && dt.nodeCount > 0) {
      dashParts.push(theme.fg("accent", `◈ D:${dt.decidedCount}/${dt.nodeCount}`));
    }

    // OpenSpec summary
    const os = sharedState.openspec;
    if (os && os.changes.length > 0) {
      dashParts.push(theme.fg("accent", `◎ OS:${os.changes.length}`));
    }

    // Cleave summary
    const cl = sharedState.cleave;
    if (cl) {
      const icon = cl.status === "idle" ? theme.fg("dim", "⚡ idle")
        : cl.status === "done" ? theme.fg("success", "⚡ done")
        : cl.status === "failed" ? theme.fg("error", "⚡ fail")
        : theme.fg("warning", `⚡ ${cl.status}`);
      dashParts.push(icon);
    }

    // Context gauge (absorbed from status-bar)
    const gauge = this.buildContextGauge(16);
    if (gauge) {
      dashParts.push(gauge);
    }

    if (dashParts.length > 0) {
      lines.push(truncatePlain(dashParts.join("  "), width));
    }

    // Line 2-3: Original footer data (pwd + stats)
    lines.push(...this.renderFooterData(width));

    return lines;
  }

  // ── Raised Mode (Layer 1) ─────────────────────────────────────

  private renderRaised(width: number): string[] {
    const theme = this.theme;
    const lines: string[] = [];

    // Design tree section
    const dt = sharedState.designTree;
    if (dt && dt.nodeCount > 0) {
      const statusParts: string[] = [];
      if (dt.decidedCount > 0) statusParts.push(theme.fg("success", `${dt.decidedCount} decided`));
      if (dt.exploringCount > 0) statusParts.push(theme.fg("accent", `${dt.exploringCount} exploring`));
      if (dt.blockedCount > 0) statusParts.push(theme.fg("error", `${dt.blockedCount} blocked`));
      if (dt.openQuestionCount > 0) statusParts.push(theme.fg("dim", `${dt.openQuestionCount}?`));

      lines.push(theme.fg("accent", "◈ Design Tree") + "  " + statusParts.join(" · "));

      if (dt.focusedNode) {
        const statusIcon = dt.focusedNode.status === "decided" ? theme.fg("success", "●")
          : dt.focusedNode.status === "exploring" ? theme.fg("accent", "◐")
          : dt.focusedNode.status === "blocked" ? theme.fg("error", "✕")
          : theme.fg("dim", "○");
        const qCount = dt.focusedNode.questions.length > 0
          ? theme.fg("dim", ` — ${dt.focusedNode.questions.length} open questions`)
          : "";
        lines.push(`  ${statusIcon} ${dt.focusedNode.title}${qCount}`);
      }
    }

    // OpenSpec section
    const os = sharedState.openspec;
    if (os && os.changes.length > 0) {
      lines.push(theme.fg("accent", "◎ OpenSpec") + "  " + theme.fg("dim", `${os.changes.length} change${os.changes.length > 1 ? "s" : ""}`));
      for (const c of os.changes.slice(0, 3)) {
        const done = c.tasksTotal > 0 && c.tasksDone >= c.tasksTotal;
        const icon = done ? theme.fg("success", "✓") : theme.fg("dim", "◦");
        const progress = c.tasksTotal > 0
          ? theme.fg(done ? "success" : "dim", ` ${c.tasksDone}/${c.tasksTotal}`)
          : "";
        const stage = c.stage ? theme.fg("dim", ` [${c.stage}]`) : "";
        lines.push(`  ${icon} ${c.name}${progress}${stage}`);
      }
    }

    // Cleave section
    const cl = sharedState.cleave;
    if (cl && cl.status !== "idle") {
      const statusColor = cl.status === "done" ? "success"
        : cl.status === "failed" ? "error"
        : "warning";
      lines.push(theme.fg("accent", "⚡ Cleave") + "  " + theme.fg(statusColor as any, cl.status));

      if (cl.children && cl.children.length > 0) {
        const doneCount = cl.children.filter(c => c.status === "done").length;
        const failCount = cl.children.filter(c => c.status === "failed").length;
        const summary = `  ${doneCount}/${cl.children.length} ✓`;
        const failSuffix = failCount > 0 ? theme.fg("error", ` ${failCount} ✕`) : "";
        lines.push(theme.fg("dim", summary) + failSuffix);
      }
    }

    // Separator
    if (lines.length > 0) {
      lines.push(theme.fg("dim", "─".repeat(Math.min(width, 60))));
    }

    // Original footer data
    lines.push(...this.renderFooterData(width));

    // Cap at 10 lines
    return lines.slice(0, 10);
  }

  // ── Context Gauge (from status-bar) ───────────────────────────

  private buildContextGauge(barWidth: number): string {
    const theme = this.theme;
    const ctx = this.ctxRef;
    if (!ctx) return "";

    const usage = ctx.getContextUsage();
    const pct = usage?.percent ?? 0;
    const contextWindow = usage?.contextWindow ?? 0;

    // Calculate memory's share
    const memTokens = sharedState.memoryTokenEstimate;
    const memPct = contextWindow > 0 ? (memTokens / contextWindow) * 100 : 0;
    const convPct = Math.max(0, pct - memPct);

    // Convert to block counts
    const memBlocks = memPct > 0 ? Math.max(1, Math.round((memPct / 100) * barWidth)) : 0;
    const convBlocks = convPct > 0 ? Math.max(1, Math.round((convPct / 100) * barWidth)) : 0;
    const totalFilled = Math.min(memBlocks + convBlocks, barWidth);
    const freeBlocks = barWidth - totalFilled;

    // Severity color
    const convColor = pct > 70 ? "error" : pct > 45 ? "warning" : "muted";

    let bar = "";
    if (memBlocks > 0) bar += theme.fg("accent", "▓".repeat(memBlocks));
    if (convBlocks > 0) bar += theme.fg(convColor as any, "█".repeat(convBlocks));
    if (freeBlocks > 0) bar += theme.fg("dim", "░".repeat(freeBlocks));

    const turns = this.dashState.turns;
    const pctStr = `${Math.round(pct)}%`;
    const pctColored = pct > 70 ? theme.fg("error", pctStr)
      : pct > 45 ? theme.fg("warning", pctStr)
      : theme.fg("dim", pctStr);

    return `${theme.fg("dim", `T${turns}`)} ${bar} ${pctColored}`;
  }

  // ── Original Footer Data ──────────────────────────────────────

  private renderFooterData(width: number): string[] {
    const theme = this.theme;
    const ctx = this.ctxRef;
    const lines: string[] = [];

    // pwd + git branch + session name
    let pwd = process.cwd();
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home && pwd.startsWith(home)) {
      pwd = `~${pwd.slice(home.length)}`;
    }

    const branch = this.footerData.getGitBranch();
    if (branch) pwd = `${pwd} (${branch})`;

    const sessionName = ctx?.sessionManager?.getSessionName?.();
    if (sessionName) pwd = `${pwd} • ${sessionName}`;

    lines.push(truncatePlain(theme.fg("dim", pwd), width));

    // Stats line: tokens + cost + context% + model
    if (ctx) {
      const statsParts: string[] = [];

      // Cumulative tokens from all entries
      let totalInput = 0;
      let totalOutput = 0;
      let totalCacheRead = 0;
      let totalCacheWrite = 0;
      let totalCost = 0;

      try {
        for (const entry of ctx.sessionManager.getEntries()) {
          if (entry.type === "message" && (entry as any).message?.role === "assistant") {
            const usage = (entry as any).message.usage;
            if (usage) {
              totalInput += usage.input || 0;
              totalOutput += usage.output || 0;
              totalCacheRead += usage.cacheRead || 0;
              totalCacheWrite += usage.cacheWrite || 0;
              totalCost += usage.cost?.total || 0;
            }
          }
        }
      } catch { /* session may not be ready */ }

      if (totalInput) statsParts.push(`↑${formatTokens(totalInput)}`);
      if (totalOutput) statsParts.push(`↓${formatTokens(totalOutput)}`);
      if (totalCacheRead) statsParts.push(`R${formatTokens(totalCacheRead)}`);
      if (totalCacheWrite) statsParts.push(`W${formatTokens(totalCacheWrite)}`);

      if (totalCost) {
        statsParts.push(`$${totalCost.toFixed(3)}`);
      }

      // Context %
      const usage = ctx.getContextUsage();
      const pct = usage?.percent ?? 0;
      const contextWindow = usage?.contextWindow ?? 0;
      const pctDisplay = usage?.percent !== null
        ? `${pct.toFixed(1)}%/${formatTokens(contextWindow)}`
        : `?/${formatTokens(contextWindow)}`;

      if (pct > 90) {
        statsParts.push(theme.fg("error", pctDisplay));
      } else if (pct > 70) {
        statsParts.push(theme.fg("warning", pctDisplay));
      } else {
        statsParts.push(pctDisplay);
      }

      const statsLeft = statsParts.join(" ");

      // Right side: model + thinking
      const model = ctx.model;
      const modelName = model?.id || "no-model";
      let rightSide = modelName;

      // Thinking level — infer from recent entries
      if (model?.reasoning) {
        const entries = ctx.sessionManager.getEntries();
        let thinkingLevel = "off";
        for (let i = entries.length - 1; i >= 0; i--) {
          const e = entries[i] as any;
          if (e.type === "thinking_level_change" && e.thinkingLevel) {
            thinkingLevel = e.thinkingLevel;
            break;
          }
        }
        rightSide = thinkingLevel === "off"
          ? `${modelName} • thinking off`
          : `${modelName} • ${thinkingLevel}`;
      }

      // Multi-provider indicator
      if (this.footerData.getAvailableProviderCount() > 1 && model) {
        rightSide = `(${model.provider}) ${rightSide}`;
      }

      // Layout: left-align stats, right-align model
      const statsLeftPlain = statsLeft.replace(/\x1b\[[0-9;]*m/g, "");
      const rightSidePlain = rightSide.replace(/\x1b\[[0-9;]*m/g, "");
      const totalNeeded = statsLeftPlain.length + 2 + rightSidePlain.length;

      let statsLine: string;
      if (totalNeeded <= width) {
        const padding = " ".repeat(width - statsLeftPlain.length - rightSidePlain.length);
        statsLine = statsLeft + padding + rightSide;
      } else {
        statsLine = statsLeft;
      }

      lines.push(theme.fg("dim", statsLine));
    }

    // Extension statuses
    const extensionStatuses = this.footerData.getExtensionStatuses();
    if (extensionStatuses.size > 0) {
      const sortedStatuses = Array.from(extensionStatuses.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, text]) => sanitizeStatusText(text));
      const statusLine = sortedStatuses.join(" ");
      lines.push(truncatePlain(statusLine, width));
    }

    return lines;
  }
}
