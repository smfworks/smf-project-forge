#!/usr/bin/env python3
"""
forge-status-push — Posts openclaw session list to SMF Project Forge.
Runs every 5 seconds via cron. Uses gzip compression for large payloads.
"""
import subprocess
import json
import os
import urllib.request
import gzip

GATEWAY = os.environ.get("GATEWAY_NAME", "mikesai1")
FORGE_URL = "https://smf-project-forge.vercel.app/api/agents/status-push"
API_KEY = "c609132c795b6d17e7ea88f156b9c6abdee549ccd5e1fec703899844e34a3543"

def main():
    # Get sessions from openclaw — active sessions only (last 2 min) keeps payload small
    result = subprocess.run(
        ["openclaw", "sessions", "--all-agents", "--active", "2", "--json"],
        capture_output=True, text=True, timeout=10
    )
    sessions_json = result.stdout if result.returncode == 0 else '{"sessions":[]}'

    payload = json.dumps({"gateway": GATEWAY, "sessions": sessions_json}).encode()
    # Compress to handle the full 189-session payload reliably
    compressed = gzip.compress(payload)

    req = urllib.request.Request(
        FORGE_URL,
        data=compressed,
        headers={
            "Content-Type": "application/json",
            "X-Forge-Api-Key": API_KEY,
            "Content-Encoding": "gzip",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            if data.get("ok"):
                print(f"Pushed {data.get('count', 0)} sessions for {GATEWAY}")
            else:
                print(f"Push error: {data}")
    except Exception as e:
        print(f"Push failed: {e}", flush=True)

if __name__ == "__main__":
    main()
