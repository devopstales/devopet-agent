/**
 * Sci-UI — shared visual primitives for Alpharius-styled tool call rendering.
 *
 * Design language:
 *   Call line:   ◈──{ tool_name }── summary text ──────────────────────────
 *   Loading:     ▶░░░░░▓▒{ tool_name }░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 *   Result:        ╰── ✓ compact summary
 *   Expanded:      │ line 1
 *                  │ line 2
 *                  ╰── N lines
 *   Banner:      ── ◈ label ──────────────────────────────────────────────
 *                  content line
 */
import { truncateToWidth, visibleWidth } from "@cwilson613/pi-tui";
import type { Theme } from "@cwilson613/pi-coding-agent";

export interface SciComponent {
	render(width: number): string[];
	invalidate(): void;
}

// ─── Tool glyphs by name ───────────────────────────────────────────────────

export const TOOL_GLYPHS: Record<string, string> = {
	// design tree
	design_tree: "◈",
	design_tree_update: "◈",
	// openspec
	openspec_manage: "◎",
	// memory
	memory_store: "⌗",
	memory_recall: "⌗",
	memory_query: "⌗",
	memory_focus: "⌗",
	memory_release: "⌗",
	memory_supersede: "⌗",
	memory_archive: "⌗",
	memory_compact: "⌗",
	memory_connect: "⌗",
	memory_search_archive: "⌗",
	memory_episodes: "⌗",
	memory_ingest_lifecycle: "⌗",
	// cleave
	cleave_run: "⚡",
	cleave_assess: "⚡",
	// auth
	whoami: "⊙",
	// chronos
	chronos: "◷",
	// web search
	web_search: "⌖",
	// render / view
	render_diagram: "⬡",
	render_native_diagram: "⬡",
	render_excalidraw: "⬡",
	render_composition_still: "⬡",
	render_composition_video: "⬡",
	generate_image_local: "⬡",
	view: "⬡",
};

export function glyphFor(toolName: string): string {
	return TOOL_GLYPHS[toolName] ?? "▸";
}

// ─── SciCallLine ──────────────────────────────────────────────────────────
//
//   ◈──{ design_tree }── node_id:exploring ─────────────────────────────
//   ^   ^^^^^^^^^^^       ^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^^^
//   glyph  tool name (accent)   summary (muted)   fill ─── (dim)

export class SciCallLine implements SciComponent {
	constructor(
		private glyph: string,
		private toolName: string,
		private summary: string,
		private theme: Theme,
	) {}

	render(width: number): string[] {
		const { theme: th } = this;
		const g = th.fg("accent", this.glyph);
		const dashes = th.fg("dim", "──");
		const openBracket = th.fg("border", "{");
		const closeBracket = th.fg("border", "}");
		const name = th.fg("accent", this.toolName);
		const sep = th.fg("dim", "──");
		const sumText = this.summary
			? " " + th.fg("muted", this.summary) + " "
			: " ";

		const core = `${g}${dashes}${openBracket}${name}${closeBracket}${sep}${sumText}`;
		const coreVw = visibleWidth(core);
		const fillLen = Math.max(0, width - coreVw);
		const fill = th.fg("dim", "─".repeat(fillLen));

		return [truncateToWidth(core + fill, width)];
	}

	invalidate(): void {}
}

// ─── SciLoadingLine ───────────────────────────────────────────────────────
//
//   ▶░░░░░▓▒{ tool_name }░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
//
// A bright "cursor" block scans left→right in the free space to the left of
// the tool name. Re-renders each time render() is called using Date.now().

export class SciLoadingLine implements SciComponent {
	constructor(
		private toolName: string,
		private theme: Theme,
	) {}

	render(width: number): string[] {
		const { theme: th } = this;
		const label = `{ ${this.toolName} }`;
		const labelVw = visibleWidth(label);
		// Reserve: 1 char glyph + bar + 1 space + label
		const barWidth = Math.max(4, width - labelVw - 2);
		const fps120ms = 120;
		const frame = Math.floor(Date.now() / fps120ms) % barWidth;

		const bar = Array.from({ length: barWidth }, (_, i) => {
			if (i === frame) return th.fg("accent", "▓");
			if (i === (frame + 1) % barWidth) return th.fg("muted", "▒");
			return th.fg("dim", "░");
		}).join("");

		const line =
			th.fg("accent", "▶") +
			bar +
			th.fg("muted", "{") +
			th.fg("accent", ` ${this.toolName} `) +
			th.fg("muted", "}");

		return [truncateToWidth(line, width)];
	}

	invalidate(): void {}
}

// ─── SciResult (compact / collapsed) ─────────────────────────────────────
//
//   ╰── ✓ compact summary
//   ╰── ✕ error text
//   ╰── · pending

export class SciResult implements SciComponent {
	constructor(
		private summary: string,
		private status: "success" | "error" | "pending",
		private theme: Theme,
	) {}

	render(width: number): string[] {
		const { theme: th } = this;
		const cap = th.fg("dim", "  ╰──");
		const dot =
			this.status === "success"
				? th.fg("success", " ✓")
				: this.status === "error"
					? th.fg("error", " ✕")
					: th.fg("dim", " ·");
		const capVw = visibleWidth(cap + dot);
		const textLen = Math.max(1, width - capVw - 1);
		const text = " " + th.fg("muted", truncateToWidth(this.summary, textLen));
		return [truncateToWidth(cap + dot + text, width)];
	}

	invalidate(): void {}
}

// ─── SciExpandedResult ───────────────────────────────────────────────────
//
//   │ line 1
//   │ line 2
//   ╰── footer summary

export class SciExpandedResult implements SciComponent {
	constructor(
		private lines: string[],
		private footerSummary: string,
		private theme: Theme,
	) {}

	render(width: number): string[] {
		const { theme: th } = this;
		const innerWidth = Math.max(1, width - 4);
		const result: string[] = [];
		for (const line of this.lines) {
			const styled = th.fg("dim", "  │") + " " + truncateToWidth(line, innerWidth);
			result.push(styled);
		}
		result.push(th.fg("dim", "  ╰──") + " " + th.fg("muted", truncateToWidth(this.footerSummary, Math.max(1, width - 8))));
		return result;
	}

	invalidate(): void {}
}

// ─── SciStack (call + result in one component) ────────────────────────────
//
// Combines SciCallLine (or SciLoadingLine when pending) with SciResult or
// SciExpandedResult, eliminating the need for callers to manage two objects.

export class SciStack implements SciComponent {
	private cachedLines?: string[];
	private cachedWidth?: number;
	private cachedTs?: number; // last render timestamp — for animation invalidation

	constructor(
		private callLine: SciComponent,
		private resultLine: SciComponent | null,
	) {}

	render(width: number): string[] {
		const now = Date.now();
		// Bust cache every ~120ms for animation (loading line)
		const animating = !this.resultLine;
		if (
			this.cachedLines &&
			this.cachedWidth === width &&
			(!animating || (this.cachedTs !== undefined && now - this.cachedTs < 120))
		) {
			return this.cachedLines;
		}
		const lines: string[] = [];
		lines.push(...this.callLine.render(width));
		if (this.resultLine) {
			lines.push(...this.resultLine.render(width));
		}
		this.cachedLines = lines;
		this.cachedWidth = width;
		this.cachedTs = now;
		return lines;
	}

	invalidate(): void {
		this.cachedLines = undefined;
		this.cachedTs = undefined;
		this.callLine.invalidate();
		this.resultLine?.invalidate();
	}
}

// ─── SciBanner (custom message renderer) ─────────────────────────────────
//
//   ── ◈ label ──────────────────────────────────────────────────────────
//     content line 1
//     content line 2

export class SciBanner implements SciComponent {
	constructor(
		private glyph: string,
		private label: string,
		private contentLines: string[],
		private theme: Theme,
	) {}

	render(width: number): string[] {
		const { theme: th } = this;
		const midText = ` ${th.fg("accent", this.glyph)} ${th.fg("muted", this.label)} `;
		const midVw = visibleWidth(midText);
		const leftLen = 2;
		const rightLen = Math.max(0, width - midVw - leftLen);
		const header =
			th.fg("dim", "──") +
			midText +
			th.fg("dim", "─".repeat(rightLen));

		const result = [truncateToWidth(header, width)];
		for (const line of this.contentLines) {
			result.push(truncateToWidth("  " + line, width));
		}
		return result;
	}

	invalidate(): void {}
}

// ─── Convenience builders ─────────────────────────────────────────────────

/** Build a SciCallLine from a tool name + summary string. */
export function sciCall(toolName: string, summary: string, theme: Theme): SciCallLine {
	return new SciCallLine(glyphFor(toolName), toolName, summary, theme);
}

/** Build a SciLoadingLine for use during isPartial. */
export function sciLoading(toolName: string, theme: Theme): SciLoadingLine {
	return new SciLoadingLine(toolName, theme);
}

/** Compact success result line. */
export function sciOk(summary: string, theme: Theme): SciResult {
	return new SciResult(summary, "success", theme);
}

/** Compact error result line. */
export function sciErr(summary: string, theme: Theme): SciResult {
	return new SciResult(summary, "error", theme);
}

/** Compact pending result line. */
export function sciPending(summary: string, theme: Theme): SciResult {
	return new SciResult(summary, "pending", theme);
}

/** Expanded result with bordered body. */
export function sciExpanded(lines: string[], footer: string, theme: Theme): SciExpandedResult {
	return new SciExpandedResult(lines, footer, theme);
}

/** Banner for message renderers. */
export function sciBanner(glyph: string, label: string, lines: string[], theme: Theme): SciBanner {
	return new SciBanner(glyph, label, lines, theme);
}
