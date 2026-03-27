/**
 * GET /api/agents/status
 *
 * Returns live agent statuses for the roster page.
 * Reads from the Turso cache (populated by gateway push scripts).
 */
import { getAgentStatusCache } from "@/lib/db";
import { NextResponse } from "next/server";
import { AGENTS } from "@/lib/config";

export async function GET() {
  let cache: Array<{
    gateway: string;
    sessionKey: string;
    sessionId: string;
    agentId: string;
    model: string;
    kind: string;
    status: "active" | "idle" | "blocked";
    updatedAt: number;
    lastSeen: number;
  }>;

  try {
    cache = await getAgentStatusCache();
  } catch {
    // If DB not configured, return empty — roster falls back to idle
    return NextResponse.json([], { status: 200 });
  }

  // Build lookup: agentId → latest status across all gateways
  const latest: Record<string, typeof cache[number]> = {};
  for (const row of cache) {
    const existing = latest[row.agentId];
    if (!existing || row.lastSeen > existing.lastSeen) {
      latest[row.agentId] = row;
    }
  }

  // Map to the 28 known agents (from config)
  const statuses = AGENTS.map((agent) => {
    const cached = latest[agent.id];

    if (!cached) {
      return {
        id: agent.id,
        name: agent.name,
        team: agent.team,
        gateway: agent.gateway,
        status: "idle" as const,
        model: agent.model,
      };
    }

    // For main sessions, map to agent name
    const isCron = cached.kind === "cron";
    const currentTask = isCron
      ? `Cron: ${cached.sessionKey.split(":")[3]?.slice(0, 8) ?? "job"}...`
      : undefined;

    return {
      id: agent.id,
      name: agent.name,
      team: agent.team,
      gateway: cached.gateway,
      status: cached.status,
      model: cached.model || agent.model,
      currentTask,
      lastSeen: cached.lastSeen,
    };
  });

  return NextResponse.json(statuses);
}
