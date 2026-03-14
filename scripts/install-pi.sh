#!/usr/bin/env bash
# Build and install pi globally from the vendored fork.
#
# This packs the coding-agent package into a tarball and installs it
# globally with all dependencies resolved. Using a tarball avoids the
# symlink issue where npm install -g from a workspace package creates a
# symlink that breaks Node's module resolution for hoisted dependencies
# (e.g., @sinclair/typebox lives in the monorepo root node_modules but
# Node resolves from the apparent symlink path, not the real path).
#
# Usage:
#   ./scripts/install-pi.sh          # build + install
#   ./scripts/install-pi.sh --skip-build   # install only (assumes dist/ is current)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PI_MONO="$ROOT_DIR/vendor/pi-mono"
CODING_AGENT="$PI_MONO/packages/coding-agent"

# ── Build ─────────────────────────────────────────────────────────────────
if [[ "${1:-}" != "--skip-build" ]]; then
  echo "▸ Building pi-mono..."
  (cd "$PI_MONO" && npm run build)
else
  echo "▸ Skipping build (--skip-build)"
fi

# ── Pack ──────────────────────────────────────────────────────────────────
echo "▸ Packing @cwilson613/pi-coding-agent..."
TARBALL=$(cd "$CODING_AGENT" && npm pack --pack-destination /tmp 2>/dev/null | tail -1)
TARBALL_PATH="/tmp/$TARBALL"

if [[ ! -f "$TARBALL_PATH" ]]; then
  echo "✗ Pack failed — tarball not found at $TARBALL_PATH" >&2
  exit 1
fi

echo "  → $TARBALL_PATH"

# ── Install globally ─────────────────────────────────────────────────────
echo "▸ Installing globally..."
npm install -g "$TARBALL_PATH" 2>&1 | grep -v "^npm warn"

# ── Verify ────────────────────────────────────────────────────────────────
INSTALLED_VERSION=$(pi --version 2>/dev/null || echo "FAILED")
echo ""
echo "✓ pi $INSTALLED_VERSION installed globally"

# Quick dep check
GLOBAL_PKG="/opt/homebrew/lib/node_modules/@cwilson613/pi-coding-agent"
if [[ -L "$GLOBAL_PKG" ]]; then
  echo "⚠ WARNING: Global install is a symlink — deps may not resolve correctly"
  echo "  Run without a workspace package or use npm pack + npm install -g <tarball>"
elif [[ ! -d "$GLOBAL_PKG/node_modules/@sinclair/typebox" ]]; then
  echo "⚠ WARNING: @sinclair/typebox not found in global install"
else
  echo "✓ Dependencies resolved"
fi

# ── Cleanup ───────────────────────────────────────────────────────────────
rm -f "$TARBALL_PATH"
echo "✓ Cleaned up tarball"
