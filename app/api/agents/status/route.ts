import { NextResponse } from "next/server";
import { getAgentStatusCache } from "@/lib/db";
import { AGENTS, TEAMS } from "@/lib/config";

// GET /api/agents/status
// Returns all config agents merged with live status from cache
export async function GET() {
  try {
    const cache = await getAgentStatusCache();
    const now = Date.now();

    // Build a map of sessionKey → cached entry (most recent)
    const cacheByKey: Record<string, typeof cache[0]> = {};
    for (const entry of cache) {
      const existing = cacheByKey[entry.sessionKey];
      if (!existing || entry.lastSeen > existing.lastSeen) {
        cacheByKey[entry.sessionKey] = entry;
      }
    }

    // For each config agent, find matching cached session
    const agentCache: Record<string, typeof cache[0]> = {};
    for (const entry of Object.values(cacheByKey)) {
      // Match by agentId or sessionKey pattern
      const a = AGENTS.find(
        (ag) =>
          ag.id === entry.agentId ||
          `agent:${entry.agentId}` === ag.id ||
          entry.sessionKey.includes(ag.id) ||
          // Match main sessions to Aiona
          (entry.sessionKey === "agent:main:main" && ag.team === "aiona" && ag.gateway === "aiona")
      );
      if (a) {
        const existing = agentCache[a.id];
        if (!existing || entry.lastSeen > existing.lastSeen) {
          agentCache[a.id] = entry;
        }
      }
    }

    // Build final status list — all config agents, with live status overlaid
    const statuses = AGENTS.map((agent) => {
      const entry = agentCache[agent.id];
      const team = TEAMS[agent.team];

      // Derive status
      let status: "active" | "idle" | "blocked" = "idle";
      if (entry) {
        const ageMs = now - (entry.lastSeen ?? entry.updatedAt);
        if (entry.status === "blocked") status = "blocked";
        else if (entry.status === "active") status = "active";
        else if (ageMs < 120_000) status = "active"; // Updated < 2 min ago
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
    // Fallback: return all agents as idle
    return NextResponse.json(
      AGENTS.map((a) => ({ id: a.id, name: a.name, team: a.team, status: "idle" as const }))
    );
  }
}
