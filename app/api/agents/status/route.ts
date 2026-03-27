import { NextResponse } from "next/server";
import { getAgentStatusCache } from "@/lib/db";
import { AGENTS, TEAMS } from "@/lib/config";

// GET /api/agents/status
// Returns all config agents merged with live status from cache
export async function GET() {
  try {
    const cache = await getAgentStatusCache();
    const now = Date.now();

    // Deduplicate by (gateway, agentId) — one canonical entry per agent
    const seen = new Set<string>();
    const agentEntries: typeof cache = [];

    // Sort by lastSeen descending so we keep the most recent for each agent
    const sorted = [...cache].sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0));

    for (const entry of sorted) {
      const key = `${entry.gateway}:${entry.agentId}`;
      if (!seen.has(key)) {
        seen.add(key);
        agentEntries.push(entry);
      }
    }

    // Build a lookup: agentId → cache entry
    const cacheByAgentId: Record<string, typeof cache[0]> = {};
    for (const entry of agentEntries) {
      // Prefer exact agentId match
      if (!cacheByAgentId[entry.agentId]) {
        cacheByAgentId[entry.agentId] = entry;
      }
    }

    // For each config agent, look up its live status
    const statuses = AGENTS.map((agent) => {
      const entry = cacheByAgentId[agent.id];
      const team = TEAMS[agent.team];

      // Derive status from session age — always check current time, not cached status
      let status: "active" | "idle" | "blocked" = "idle";
      if (entry) {
        const ageMs = now - (entry.updatedAt ?? entry.lastSeen);
        if (ageMs < 120_000) status = "active";       // session updated < 2 min ago
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
