#!/usr/bin/env python3
"""
forge-status-push — Posts openclaw session list to SMF Project Forge.
Runs every 5 seconds via cron.
"""
import subprocess
import json
import os
import tempfile

GATEWAY = os.environ.get("GATEWAY_NAME", "mikesai1")
FORGE_URL = "https://smf-project-forge.vercel.app/api/agents/status-push"
API_KEY = "c609132c795b6d17e7ea88f156b9c6abdee549ccd5e1fec703899844e34a3543"

def main():
    # Get ALL sessions — ensures roster always has fresh state for active work
    result = subprocess.run(
        ["openclaw", "sessions", "--all-agents", "--json"],
        capture_output=True, text=True, timeout=10
    )
    sessions_json = result.stdout if result.returncode == 0 else '{"sessions":[]}'

    payload = json.dumps({"gateway": GATEWAY, "sessions": sessions_json})

    # Write payload to temp file — subprocess curl is more reliable than urllib
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        f.write(payload)
        tmp = f.name

    try:
        curl = subprocess.run(
            ["curl", "-s", "-X", "POST", FORGE_URL,
             "-H", "Content-Type: application/json",
             "-H", "X-Forge-Api-Key: " + API_KEY,
             "-d", "@" + tmp,
             "--max-time", "30"],
            capture_output=True, text=True, timeout=35
        )
        data = json.loads(curl.stdout) if curl.stdout else {}
        if data.get("ok"):
            print(f"Pushed {data.get('count', 0)} sessions for {GATEWAY}")
    except Exception as e:
        print(f"Push failed: {e}", flush=True)
    finally:
        try:
            os.unlink(tmp)
        except Exception:
            pass

if __name__ == "__main__":
    main()
