#!/usr/bin/env sh
# Pre-install hook for devopet.
#
# devopet is an opinionated distribution of pi (https://github.com/badlogic/pi)
# that bundles extensions, themes, skills, and memory on top of the core
# pi coding agent by Mario Zechner (@badlogic).
#
# Both devopet and the standalone pi packages (@styrene-lab/pi-coding-agent,
# @cwilson613/pi-coding-agent, @mariozechner/pi-coding-agent) register a `pi` binary. npm cannot create
# a bin link if another package already owns it, so this script removes the
# standalone pi package before devopet installs — preventing an EEXIST error.
#
# This is NOT hostile. devopet depends on and includes the same pi core.
# If you want standalone pi back, just:
#   npm uninstall -g devopet
#   npm install -g @mariozechner/pi-coding-agent
#
# Only acts during global installs (npm_config_global=true).

node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "$node_major" -lt 20 ]; then
  echo ""
  echo "  devopet: Unsupported Node.js runtime detected ($(node -v 2>/dev/null || echo unknown))."
  echo "  devopet: devopet requires Node.js 20 or later because bundled pi-tui uses modern Unicode regex features."
  echo "  devopet: Upgrade Node.js to 20+ and retry the install/update."
  echo ""
  exit 1
fi

if [ "$npm_config_global" != "true" ]; then
  exit 0
fi

for pkg in @styrene-lab/pi-coding-agent @cwilson613/pi-coding-agent @mariozechner/pi-coding-agent; do
  if npm ls -g "$pkg" --depth=0 >/dev/null 2>&1; then
    echo ""
    echo "  devopet: Found standalone pi package ($pkg)."
    echo "  devopet: devopet bundles pi core and registers the same 'pi' command."
    echo "  devopet: Removing $pkg to avoid bin conflict..."
    echo "  devopet: (To restore standalone pi later: npm install -g $pkg)"
    echo ""
    npm uninstall -g "$pkg" 2>/dev/null || true
  fi
done

# Handle self-update: if devopet is already installed, its 'pi' and 'devopet'
# bin links conflict with the new installation. Remove stale links so npm
# can recreate them cleanly (avoids EEXIST during `pi update`).
if npm ls -g devopet --depth=0 >/dev/null 2>&1; then
  prefix="$(npm prefix -g 2>/dev/null)"
  for bin in pi devopet; do
    link="$prefix/bin/$bin"
    if [ -L "$link" ]; then
      target="$(readlink "$link" 2>/dev/null || true)"
      case "$target" in
        *devopet*) rm -f "$link" 2>/dev/null || true ;;
      esac
    fi
  done
fi
