#!/bin/bash
# forge-status-push — Run via cron on each machine every 15 seconds
# Posts openclaw session list to SMF Project Forge for live roster status
#
# Install:
#   chmod +x /usr/local/bin/forge-status-push
#   # Add to crontab:
#   * * * * * /usr/local/bin/forge-status-push mikesai1 2>/dev/null
#   * * * * * sleep 5; /usr/local/bin/forge-status-push mikesai1 2>/dev/null
#   * * * * * sleep 10; /usr/local/bin/forge-status-push mikesai1 2>/dev/null
#   * * * * * sleep 15; /usr/local/bin/forge-status-push mikesai1 2>/dev/null
#   ... (repeat across machines with mikesai2, mikesai3)
#
# The FORGE_API_KEY env var must be set (or hardcoded below).

set -euo pipefail

GATEWAY="${1:-mikesai1}"
FORGE_URL="${FORGE_URL:-https://smf-project-forge.vercel.app}"
API_KEY="${FORGE_API_KEY:-}"  # Set via environment or edit below

# ── CONFIG: Set your API key here if not using env var ──────────────────────
# API_KEY="your-forge-api-key-here"

if [[ -z "$API_KEY" ]]; then
  echo "ERROR: FORGE_API_KEY not set. Edit this script or export FORGE_API_KEY."
  exit 1
fi

# Get session JSON from local openclaw gateway
SESSIONS=$(openclaw sessions --all-agents --json 2>/dev/null || echo '{"sessions":[]}')

# POST to Forge
curl -s -X POST "${FORGE_URL}/api/agents/status-push" \
  -H "Content-Type: application/json" \
  -H "X-Forge-Api-Key: ${API_KEY}" \
  -d "{\"gateway\":\"${GATEWAY}\",\"sessions\":${SESSIONS}}" \
  > /dev/null

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ${GATEWAY} status pushed"
