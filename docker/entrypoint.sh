#!/usr/bin/env bash
# ============================================================================
# Self-updating static-site server.
#
#   1. Clone the repo on first boot and build the React app.
#   2. Serve the built site with nginx.
#   3. Poll the branch forever. When the remote HEAD moves, pull, rebuild,
#      and atomically swap the live site — all without restarting the
#      container or rebuilding the Docker image.
#
# Push to `main` and the site updates itself within POLL_INTERVAL seconds.
# ============================================================================
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ggardenhire/portfolio.git}"
REPO_BRANCH="${REPO_BRANCH:-main}"
POLL_INTERVAL="${POLL_INTERVAL:-300}"
SRC_DIR="/app/src-repo"
WEB_ROOT="/usr/share/nginx/html"

log() { echo "[$(date -u '+%Y-%m-%d %H:%M:%S')Z] $*"; }

# Build the site into dist/, then swap it into the web root only on success.
# Returns non-zero (without touching the live site) if anything fails, so a
# bad commit never takes the site down.
build_and_deploy() {
  log "Installing dependencies (npm ci)..."
  npm ci --no-audit --no-fund || { log "npm ci failed"; return 1; }

  log "Building site (npm run build)..."
  npm run build || { log "build failed"; return 1; }

  log "Publishing to web root..."
  rm -rf "${WEB_ROOT:?}/"*
  cp -r dist/. "$WEB_ROOT/"
}

# --- First boot: clone + initial build -------------------------------------
if [ ! -d "$SRC_DIR/.git" ]; then
  log "Cloning $REPO_URL (branch: $REPO_BRANCH)..."
  git clone --branch "$REPO_BRANCH" "$REPO_URL" "$SRC_DIR"
fi

cd "$SRC_DIR"
git config --global --add safe.directory "$SRC_DIR"

# A failed *initial* build is fatal — let the container restart policy retry.
build_and_deploy

log "Starting nginx..."
nginx   # daemonizes; master process runs in the background

log "Watching '$REPO_BRANCH' every ${POLL_INTERVAL}s for new commits."
while true; do
  sleep "$POLL_INTERVAL"

  if ! git fetch --quiet origin "$REPO_BRANCH"; then
    log "git fetch failed; will retry next cycle."
    continue
  fi

  local_sha="$(git rev-parse HEAD)"
  remote_sha="$(git rev-parse "origin/$REPO_BRANCH")"

  if [ "$local_sha" != "$remote_sha" ]; then
    log "Update detected: ${local_sha:0:7} -> ${remote_sha:0:7}"
    git reset --hard "origin/$REPO_BRANCH"
    if build_and_deploy; then
      log "Site updated to ${remote_sha:0:7}."
    else
      log "Build failed; previous version remains live."
    fi
  fi

  # Self-heal: make sure nginx is still up.
  if ! pgrep -x nginx >/dev/null; then
    log "nginx not running; restarting it."
    nginx
  fi
done
