import { NextResponse } from "next/server";
import { getAgentStatusCache } from "@/lib/db";
import { AGENTS } from "@/lib/config";

// GET /api/agents/status
// Returns live agent statuses from the cache (populated by machine push scripts)
export async function GET() {
  try {
    const cache = await getAgentStatusCache();
    const now = Date.now();

    // Map cache entries to AgentLiveStatus objects, matching against our config
    const statuses = cache.map((entry) => {
      // Find matching config agent by ID
      const configAgent = AGENTS.find(
        (a) =>
          a.id === entry.agentId ||
          a.id === `agent:${entry.agentId}` ||
          entry.sessionKey.includes(a.id)
      );

      // Determine status
      let status: "active" | "idle" | "blocked" = entry.status;
      if (!configAgent && entry.status === "idle" && entry.kind === "direct") {
        // Active main session with no matching config = likely active
        if (entry.sessionKey.includes(":main:main") && now - entry.updatedAt < 90_000) {
          status = "active";
        }
      }

      return {
        id: entry.agentId,
        name: configAgent?.name ?? entry.agentId,
        team: configAgent?.team ?? inferTeam(entry),
        gateway: entry.gateway,
        status,
        currentTask: entry.kind === "cron" ? "Cron job" : undefined,
        model: entry.model,
        lastSeen: entry.lastSeen,
      };
    });

    return NextResponse.json(statuses);
  } catch (err) {
    console.error("[forge] agent status error:", err);
    // Return empty array rather than error — roster shows all idle
    return NextResponse.json([]);
  }
}

function inferTeam(entry: { gateway: string; sessionKey: string }): string {
  if (entry.gateway.includes("mikesai3")) return "rafael";
  if (entry.gateway.includes("mikesai2")) return "gabriel";
  return "aiona";
}
