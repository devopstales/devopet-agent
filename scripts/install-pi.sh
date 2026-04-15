#!/usr/bin/env bash
# Dev install script: npm install + link + verify the omegon binary.
#
# Usage:
#   ./scripts/install-pi.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "▸ Installing dependencies..."
(cd "$ROOT_DIR" && npm install)

echo "▸ Linking omegon globally..."
(cd "$ROOT_DIR" && npm link --force 2>&1 | grep -v "^npm warn")

OMEGON_PATH=$(which omegon 2>/dev/null || echo "")
if [[ -z "$OMEGON_PATH" ]]; then
  echo "✗ 'omegon' command not found on PATH after linking"
  exit 1
fi

OMEGON_VERSION=$(omegon --version 2>/dev/null || echo "FAILED")

echo ""
echo "✓ omegon $OMEGON_VERSION"
echo "  → $OMEGON_PATH"
echo ""
echo "✓ Restart devopet to pick up changes."
