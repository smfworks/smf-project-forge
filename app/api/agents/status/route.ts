import { NextResponse } from "next/server";
import { getAgentStatusCache } from "@/lib/db";
import { AGENTS, TEAMS } from "@/lib/config";

// GET /api/agents/status
// Returns all config agents merged with live status from cache
export async function GET() {
  try {
    const cache = await getAgentStatusCache();
    const nowMs = Date.now();  // milliseconds — matches entry.lastSeen format

    // Step 1: Deduplicate by sessionKey — keep most recent entry per session
    const byKey: Record<string, typeof cache[0]> = {};
    for (const entry of cache) {
      const existing = byKey[entry.sessionKey];
      if (!existing || (entry.lastSeen ?? 0) > (existing.lastSeen ?? 0)) {
        byKey[entry.sessionKey] = entry;
      }
    }

    // Step 2: Match sessions to config agents
    // Map of agentId → canonical cache entry
    const agentCache: Record<string, typeof cache[0]> = {};

    for (const [sessionKey, entry] of Object.entries(byKey)) {
      const agentId = entry.agentId;

      // Exact match — session's agentId matches a config agent
      if (!agentCache[agentId]) {
        agentCache[agentId] = entry;
      }

      // Also map main session → aiona-edge (Michael's primary AI)
      if (sessionKey === "agent:main:main" && !agentCache["aiona-edge"]) {
        agentCache["aiona-edge"] = entry;
      }

      // Special case: agent:main:main on mikesai3 → rafael
      if (sessionKey === "agent:main:main" && entry.gateway === "mikesai3" && !agentCache["rafael"]) {
        agentCache["rafael"] = entry;
      }

      // Special case: agent:main:main on mikesai2 → gabriel
      if (sessionKey === "agent:main:main" && entry.gateway === "mikesai2" && !agentCache["gabriel"]) {
        agentCache["gabriel"] = entry;
      }

      // Special case: cron sessions for Rafael's team
      if (sessionKey.includes(":cron:") && !agentCache["rafael"]) {
        agentCache["rafael"] = entry;
      }
    }

    // Step 3: Build final status list — all config agents, with live status overlaid
    const statuses = AGENTS.map((agent) => {
      const entry = agentCache[agent.id];
      const team = TEAMS[agent.team];

      // Derive status from session age at read time (always fresh)
      // Use updatedAt from the session itself — more reliable than lastSeen
      let status: "active" | "idle" | "blocked" = "idle";
      if (entry) {
        const ageMs = (entry.updatedAt ?? 0) > 0
          ? nowMs - entry.updatedAt
          : 999_999_999; // no session data = idle
        if (ageMs < 600_000) status = "active";     // updated < 10 min ago
        else if (entry.status === "blocked") status = "blocked";
      }

      return {
        id: agent.id,
        name: agent.name,
        team: agent.team,
        emoji: agent.emoji,
        gateway: agent.gateway,
        role: agent.role,
        model: agent.model,
        status,
        currentTask: entry?.kind === "cron" ? "Cron job" : undefined,
        lastSeen: entry?.lastSeen,
        color: team.color,
      };
    });

    return NextResponse.json(statuses);
  } catch (err) {
    console.error("[forge] agent status error:", err);
    return NextResponse.json(
      AGENTS.map((a) => ({ id: a.id, name: a.name, team: a.team, status: "idle" as const }))
    );
  }
}
