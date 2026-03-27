#!/usr/bin/env python3
"""
forge-status-push.py
Pushes OpenClaw agent session status to SMF Project Forge.

Run via cron on each machine (mikesai1, mikesai2, mikesai3):
  */1 * * * * /path/to/forge-status-push.py >> /var/log/forge-status.log 2>&1

Or via OpenClaw cron (sessionTarget="isolated"):
  openclaw cron add --name "Forge Status Push" --every 60s ...

The script:
  1. Runs `openclaw sessions --all-agents --json` locally
  2. POSTs the result to https://smf-project-forge.vercel.app/api/agents/status-push
  3. Authenticated via X-Forge-Api-Key header
"""

import json
import os
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime

# ── Configuration ────────────────────────────────────────────────────────────

FORGE_API_KEY = os.environ.get("FORGE_API_KEY", "")
FORGE_URL     = os.environ.get(
    "FORGE_URL",
    "https://smf-project-forge.vercel.app/api/agents/status-push"
)

# Machine identity — must match the gateway key in lib/config.ts
MACHINE_ID = os.environ.get("MACHINE_ID", "mikesai1")   # mikesai1 | mikesai2 | mikesai3

# ── Helpers ──────────────────────────────────────────────────────────────────

def get_sessions() -> list[dict]:
    """Run `openclaw sessions` locally and return the parsed JSON."""
    result = subprocess.run(
        ["openclaw", "sessions", "--all-agents", "--json"],
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f"openclaw sessions failed: {result.stderr}")

    data = json.loads(result.stdout)
    return data.get("sessions", [])


def push_status(sessions: list[dict]) -> dict:
    """POST session list to Forge and return the JSON response."""
    payload = json.dumps({
        "gateway": MACHINE_ID,
        "sessions": sessions,
    }).encode("utf-8")

    req = urllib.request.Request(
        FORGE_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "X-Forge-Api-Key": FORGE_API_KEY,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode()}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"URL error: {e.reason}") from e


def main():
    if not FORGE_API_KEY:
        print("[{ts}] ERROR: FORGE_API_KEY not set".format(ts=datetime.now().isoformat()))
        sys.exit(1)

    try:
        sessions = get_sessions()
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] ERROR getting sessions: {e}")
        sys.exit(1)

    try:
        result = push_status(sessions)
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] ERROR pushing status: {e}")
        sys.exit(1)

    active = [s for s in sessions if s.get("ageMs", 999999999) < 90_000]
    print(
        f"[{datetime.now().isoformat()}] OK — "
        f"{len(sessions)} sessions, {len(active)} active "
        f"({MACHINE_ID}) → {result}"
    )


if __name__ == "__main__":
    main()
