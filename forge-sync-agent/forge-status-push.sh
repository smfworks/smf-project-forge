#!/usr/bin/env python3
"""
forge-status-push — Posts openclaw session list to SMF Project Forge.
Runs every 5 seconds via cron. No external dependencies.
"""
import subprocess
import urllib.request
import json
import os

GATEWAY = os.environ.get("GATEWAY_NAME", "mikesai1")
FORGE_URL = "https://smf-project-forge.vercel.app/api/agents/status-push"
API_KEY = "c609132c795b6d17e7ea88f156b9c6abdee549ccd5e1fec703899844e34a3543"

def main():
    # Get sessions from openclaw
    result = subprocess.run(
        ["openclaw", "sessions", "--all-agents", "--json"],
        capture_output=True, text=True, timeout=10
    )
    sessions_json = result.stdout if result.returncode == 0 else '{"sessions":[]}'

    payload = json.dumps({"gateway": GATEWAY, "sessions": sessions_json}).encode()

    req = urllib.request.Request(
        FORGE_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "X-Forge-Api-Key": API_KEY,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            if data.get("ok"):
                print(f"Pushed {data.get('count', 0)} sessions for {GATEWAY}")
    except Exception as e:
        print(f"Push failed: {e}", flush=True)

if __name__ == "__main__":
    main()
