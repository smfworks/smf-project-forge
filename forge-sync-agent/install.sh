#!/bin/bash
# SMF Forge Sync Agent — Per-machine install script
# Run this on mikesai1, mikesai2, and mikesai3 once.

set -e

echo "Installing SMF Forge Sync Agent..."

# 1. Create directory
sudo mkdir -p /opt/forge
sudo cp forge-sync-agent.py /opt/forge/
sudo chmod +x /opt/forge/forge-sync-agent.py

# 2. Install Python deps
pip install watchdog requests --quiet

# 3. Create config (edit this before running!)
sudo mkdir -p /etc/forge
sudo cp queues.conf.example /etc/forge/queues.conf
echo ""
echo "⚠️  EDIT /etc/forge/queues.conf BEFORE CONTINUING"
echo "   Set api_key for this machine."
echo ""

# 4. Install as systemd service (optional but recommended)
read -p "Install systemd service for auto-start? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo cp forge-sync-agent.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable forge-sync-agent
    sudo systemctl start forge-sync-agent
    echo "✓ Service installed and started"
else
    echo "To start manually:"
    echo "  python3 /opt/forge/forge-sync-agent.py"
    echo ""
    echo "To auto-start on reboot, add to crontab:"
    echo "  @reboot python3 /opt/forge/forge-sync-agent.py"
fi

echo ""
echo "✓ Installation complete"
