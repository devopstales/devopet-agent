/**
 * When no `permissions.jsonc` exists (YOLO), we still confirm a small set of
 * destructive shell patterns so basic `rm` / `dd` / etc. are not silent.
 * Full policy remains in `~/.devopet/permissions.jsonc` (bash rules).
 */

function splitShellSegments(cmd: string): string[] {
	return cmd.split(/\s*(?:;\s*|&&\s*|\|\|\s*|\n)\s*/).map((s) => s.trim()).filter(Boolean);
}

/** True if a single segment looks like a destructive command at line start. */
function segmentLooksDestructive(segment: string): boolean {
	const t = segment.trim();
	if (!t) {
		return false;
	}
	// rm / rmdir (not `git rm` — those do not start the segment with rm)
	if (/^\s*rm(\s+|$)/i.test(t)) {
		return true;
	}
	if (/^\s*rmdir(\s+|$)/i.test(t)) {
		return true;
	}
	if (/^\s*dd\s+/i.test(t)) {
		return true;
	}
	if (/^\s*mkfs/i.test(t)) {
		return true;
	}
	if (/^\s*chmod\s+.*\b777\b/.test(t)) {
		return true;
	}
	if (/^\s*shred\s+/i.test(t)) {
		return true;
	}
	return false;
}

export function isYoloDestructiveBash(cmd: string): boolean {
	const trimmed = cmd.trim();
	if (!trimmed) {
		return false;
	}
	return splitShellSegments(trimmed).some(segmentLooksDestructive);
}
