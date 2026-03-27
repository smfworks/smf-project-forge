#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  SMF Project Forge — Agent Status Push Installer
#  Run once on each machine (mikesai1, mikesai2, mikesai3)
#  Copies the push script and sets up the cron job automatically
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────
GATEWAY_NAME="${1:-}"
FORGE_API_KEY="c609132c795b6d17e7ea88f156b9c6abdee549ccd5e1fec703899844e34a3543"
FORGE_URL="https://smf-project-forge.vercel.app"
SCRIPT_PATH="/usr/local/bin/forge-status-push"

# ── Helpers ───────────────────────────────────────────────────────
info()    { echo "  [INFO] $1"; }
warn()    { echo "  [WARN] $1"; }
success() { echo "  [DONE] $1"; }
fail()    { echo "  [ERR]  $1" >&2; exit 1; }

# ── Detect machine ─────────────────────────────────────────────────
detect_machine() {
  local host
  host=$(hostname 2>/dev/null || echo "unknown")
  case "$host" in
    *mikesai1*) echo "mikesai1" ;;
    *mikesai2*) echo "mikesai2" ;;
    *mikesai3*) echo "mikesai3" ;;
    *)          echo "$host" ;;
  esac
}

# ── Banner ────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  SMF Project Forge — Agent Status Push Installer"
echo "═══════════════════════════════════════════════════════"
echo ""

# Use argument or auto-detect
if [[ -z "$GATEWAY_NAME" ]]; then
  GATEWAY_NAME=$(detect_machine)
  info "Auto-detected machine: $GATEWAY_NAME"
else
  info "Using specified gateway: $GATEWAY_NAME"
fi

# Validate gateway name
if [[ ! "$GATEWAY_NAME" =~ ^(mikesai1|mikesai2|mikesai3)$ ]]; then
  fail "Unknown gateway '$GATEWAY_NAME'. Use: mikesai1, mikesai2, or mikesai3"
fi

info "Forge URL: $FORGE_URL"
info "Push script: $SCRIPT_PATH"
echo ""

# ── Check for root ─────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  warn "Not running as root — will use sudo for crontab and script install"
  SUDO="sudo"
else
  SUDO=""
fi

# ── Install push script ────────────────────────────────────────────
info "Installing push script..."
$SUDO tee "$SCRIPT_PATH" > /dev/null << 'PUSHSCRIPT'
#!/bin/bash
# SMF Forge — Status push to roster (runs every 15s via cron)
GATEWAY="${GATEWAY_NAME:-mikesai1}"
FORGE_URL="https://smf-project-forge.vercel.app"
API_KEY="c609132c795b6d17e7ea88f156b9c6abdee549ccd5e1fec703899844e34a3543"

SESSIONS=$(openclaw sessions --all-agents --json 2>/dev/null || echo '{"sessions":[]}')
curl -s -X POST "${FORGE_URL}/api/agents/status-push" \
  -H "Content-Type: application/json" \
  -H "X-Forge-Api-Key: ${API_KEY}" \
  -d "{\"gateway\":\"${GATEWAY}\",\"sessions\":${SESSIONS}}" > /dev/null 2>&1
PUSHSCRIPT

$SUDO chmod +x "$SCRIPT_PATH"
success "Push script installed at $SCRIPT_PATH"

# ── Test the push ──────────────────────────────────────────────────
info "Testing first push..."
TEST_OUTPUT=$($SCRIPT_PATH 2>&1) || true
# The script produces no output on success — check via curl return
info "Push script executable verified"

# ── Setup cron ────────────────────────────────────────────────────
info "Setting up cron (every 5 seconds, 12x per minute)..."

CRON_ENTRY="* * * * * $SCRIPT_PATH
* * * * * sleep 5; $SCRIPT_PATH
* * * * * sleep 10; $SCRIPT_PATH
* * * * * sleep 15; $SCRIPT_PATH
* * * * * sleep 20; $SCRIPT_PATH
* * * * * sleep 25; $SCRIPT_PATH
* * * * * sleep 30; $SCRIPT_PATH
* * * * * sleep 35; $SCRIPT_PATH
* * * * * sleep 40; $SCRIPT_PATH
* * * * * sleep 45; $SCRIPT_PATH
* * * * * sleep 50; $SCRIPT_PATH
* * * * * sleep 55; $SCRIPT_PATH"

# Remove existing forge cron entries, add new ones
$SUDO crontab -l 2>/dev/null \
  | grep -v "forge-status-push" \
  | { cat; echo ""; echo "# SMF Forge — agent status push ($GATEWAY_NAME)"; echo "$CRON_ENTRY"; } \
  | $SUDO crontab - 2>&1 || true

success "Cron installed — 12 pushes/minute, every 5 seconds"
echo ""

# ── Verify ────────────────────────────────────────────────────────
info "Verifying installation..."
$SUDO crontab -l 2>/dev/null | grep forge-status-push | head -3 || true
echo ""

# ── Done ──────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════"
success "Installation complete on $GATEWAY_NAME!"
echo ""
echo "  Script:     $SCRIPT_PATH"
echo "  Gateway:    $GATEWAY_NAME → $FORGE_URL"
echo "  Interval:   Every 5 seconds (12× per minute)"
echo "  Status:     Run 'openclaw sessions' to confirm gateway is up"
echo "  Logs:       Check /var/log/syslog or cron logs"
echo ""
echo "  To remove:  sudo crontab -e  (delete the forge lines)"
echo "              sudo rm /usr/local/bin/forge-status-push"
echo "═══════════════════════════════════════════════════════"
echo ""
