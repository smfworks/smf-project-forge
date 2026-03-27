/**
 * SMF Project Forge — Agent Status Push Model
 *
 * Architecture:
 *   Each machine (mikesai1, mikesai2, mikesai3) runs forge-status-push.py every 15s
 *   via cron. It reads `openclaw sessions --all-agents --json` and POSTs to Forge.
 *
 *   Forge stores in Turso (agent_status_cache table).
 *   Roster page reads from GET /api/agents/status → Turso.
 *
 * Security: Each push includes the FORGE_API_KEY so Forge can authenticate.
 */

export type { AgentLiveStatus } from "./types";
