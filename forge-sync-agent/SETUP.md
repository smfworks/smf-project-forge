# SMF Project Forge — Agent Status Push Setup

## What this does

Each machine (mikesai1, mikesai2, mikesai3) runs a lightweight script every 5 seconds that reads the OpenClaw session list and pushes it to SMF Project Forge. The roster page at https://smf-project-forge.vercel.app then shows which agents are active, idle, or blocked — in real time.

## What you need on each machine

- `python3` (any recent version — 3.7+)
- `openclaw` CLI available in PATH
- Internet access to reach `smf-project-forge.vercel.app`
- Cron daemon running

No extra packages. No root required (runs under your user crontab).

---

## Step 1 — Download the push script

On each machine, run:

```bash
curl -fsSL \
  https://raw.githubusercontent.com/smfworks/smf-project-forge/master/forge-sync-agent/forge-status-push.sh \
  -o ~/bin/forge-status-push && \
chmod +x ~/bin/forge-status-push
```

> **Note:** If `~/bin` isn't in your PATH, put it anywhere and adjust the crontab entry below accordingly. The script has no external Python dependencies — it only uses the standard library.

---

## Step 2 — Detect your gateway name

The script auto-detects which machine it's on. Run once to verify:

```bash
python3 ~/bin/forge-status-push
```

Expected output:
```
Pushed 0 sessions for mikesai1    ← or mikesai2, mikesai3
```

If it says `Push failed: [error]`, check that `openclaw sessions --all-agents --json` works on that machine.

---

## Step 3 — Add to crontab

Run `crontab -e` and add these 12 lines at the bottom:

```
# SMF Forge — agent status push (every 5 seconds)
* * * * * ~/bin/forge-status-push
* * * * * sleep 5; ~/bin/forge-status-push
* * * * * sleep 10; ~/bin/forge-status-push
* * * * * sleep 15; ~/bin/forge-status-push
* * * * * sleep 20; ~/bin/forge-status-push
* * * * * sleep 25; ~/bin/forge-status-push
* * * * * sleep 30; ~/bin/forge-status-push
* * * * * sleep 35; ~/bin/forge-status-push
* * * * * sleep 40; ~/bin/forge-status-push
* * * * * sleep 45; ~/bin/forge-status-push
* * * * * sleep 50; ~/bin/forge-status-push
* * * * * sleep 55; ~/bin/forge-status-push
```

That's it. The cron daemon handles the rest.

---

## Step 4 — Verify it's running

```bash
# Check cron is active
crontab -l | grep forge

# Watch the push log (errors go to syslog)
tail -f /var/log/syslog | grep forge-status-push
```

Or just open https://smf-project-forge.vercel.app/roster and watch the status badges.

---

## What you'll see

| Status | Meaning |
|--------|---------|
| 🟢 **Active** | OpenClaw session updated in the last 2 minutes |
| 🟡 **Idle** | No recent session activity |
| 🔴 **Blocked** | Session marked as aborted/error |

All 28 agents are always visible (from the config). Status comes from live session data.

---

## Troubleshooting

**"Push failed: [Errno -2] Name or service not known"**
→ DNS issue. Check internet connectivity from the machine.

**"Push failed: Connection refused" or timeout**
→ Vercel cold start. The script retries automatically. First push after idle period may time out — that's normal.

**"openclaw: command not found"**
→ The `openclaw` CLI isn't in your PATH. Find it with `which openclaw` and use the full path in the script, or ensure it's in your system PATH.

**Crontab not running the script**
→ Make sure the cron daemon is running: `sudo service cron status`
→ Check crontab: `crontab -l | grep forge`

**Wrong gateway name in pushes**
→ The script auto-detects from `hostname`. If your hostname doesn't contain "mikesai1/2/3", set it manually:
   ```bash
   GATEWAY_NAME=mikesai2 ~/bin/forge-status-push
   ```

---

## Removing the push script

```bash
# Remove from crontab
crontab -e   # delete the 12 forge lines

# Remove the script
rm ~/bin/forge-status-push
```

---

## What the script does (for reference)

```
Every 5 seconds:
  1. Runs: openclaw sessions --all-agents --active 2 --json
     → Gets sessions updated in last 2 minutes only (keeps payload tiny)
  2. Writes JSON to temp file
  3. POSTs to https://smf-project-forge.vercel.app/api/agents/status-push
  4. Deletes temp file
  5. Done — silent if successful
```

No data is stored on the machine. No credentials needed (API key is baked in).
