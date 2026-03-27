import { NextResponse } from "next/server";
import { getAgentStatusCache } from "@/lib/db";
import { AGENTS } from "@/lib/config";

// GET /api/agents/status
// Returns live agent statuses from the cache (populated by machine push scripts)
export async function GET() {
  try {
    const cache = await getAgentStatusCache();
    const now = Date.now();

    // Deduplicate by agentId — keep the most recently updated entry
    const byAgent: Record<string, typeof cache[0]> = {};
    for (const entry of cache) {
      const existing = byAgent[entry.agentId];
      if (!existing || entry.lastSeen > existing.lastSeen) {
        byAgent[entry.agentId] = entry;
      }
    }

    // Map to final status objects
    const statuses = Object.values(byAgent).map((entry) => {
      // Find matching config agent
      const configAgent = AGENTS.find(
        (a) =>
          a.id === entry.agentId ||
          a.id === `agent:${entry.agentId}` ||
          entry.sessionKey.includes(a.id) ||
          // Match by session kind: "main" → primary agents
          (entry.sessionKey === "agent:main:main" && a.team === "aiona") ||
          (entry.sessionKey.includes(":cron:") && a.team === "rafael")
      );

      // Recompute status from current time — not stale cached ageMs
      let status: "active" | "idle" | "blocked" = "idle";
      if (entry.status === "blocked") status = "blocked";
      else if (entry.status === "active") status = "active";
      else {
        // Fallback: session updated in last 2 minutes = active
        const ageMs = now - (entry.updatedAt ?? entry.lastSeen);
        if (ageMs < 120_000) status = "active";
      }

      return {
        id: configAgent?.id ?? entry.agentId,
        name: configAgent?.name ?? (entry.agentId === "main" ? "Aiona (main)" : entry.agentId),
        team: configAgent?.team ?? inferTeam(entry),
        gateway: entry.gateway,
        status,
        currentTask: entry.kind === "cron" ? "Cron job" : undefined,
        model: entry.model || configAgent?.model,
        lastSeen: entry.lastSeen,
      };
    });

    return NextResponse.json(statuses);
  } catch (err) {
    console.error("[forge] agent status error:", err);
    return NextResponse.json([]);
  }
}

function inferTeam(entry: { gateway: string; sessionKey: string }): string {
  if (entry.sessionKey.includes(":cron:")) return "rafael";
  if (entry.gateway.includes("mikesai3")) return "rafael";
  if (entry.gateway.includes("mikesai2")) return "gabriel";
  return "aiona";
}
