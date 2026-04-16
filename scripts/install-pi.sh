#!/usr/bin/env bash
# Dev install script: npm install + link + verify the devopet binary.
#
# Usage:
#   ./scripts/install-pi.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "▸ Installing dependencies..."
(cd "$ROOT_DIR" && npm install)

echo "▸ Linking devopet globally..."
(cd "$ROOT_DIR" && npm link --force 2>&1 | grep -v "^npm warn")

DEVOPET_PATH=$(which devopet 2>/dev/null || echo "")
if [[ -z "$DEVOPET_PATH" ]]; then
  echo "✗ 'devopet' command not found on PATH after linking"
  exit 1
fi

DEVOPET_VERSION=$(devopet --version 2>/dev/null || echo "FAILED")

echo ""
echo "✓ devopet $DEVOPET_VERSION"
echo "  → $DEVOPET_PATH"
echo ""
echo "✓ Restart devopet to pick up changes."
