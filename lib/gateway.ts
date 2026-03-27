/**
 * SMF Project Forge — Agent Status
 *
 * Two modes:
 * 1. PUSH (default): Machine cron scripts POST session JSON → Forge API
 *    → Use parseSessionsOutput() to parse openclaw sessions --json output
 *    → Use upsertAgentStatusCache() / getAgentStatusCache() in lib/db.ts
 *
 * 2. PULL (optional): Forge SSHs to gateways to fetch sessions directly
 *    → Not used by default — requires SSH access from Vercel serverless
 */

import type { AgentLiveStatus } from "./types";

export type { AgentLiveStatus } from "./types";

/**
 * Parse the output of `openclaw sessions --all-agents --json`
 * into a flat array of session records.
 */
export function parseSessionsOutput(
  gateway: string,
  output: string
): Array<{
  sessionKey: string;
  sessionId: string;
  agentId: string;
  updatedAt: number;
  ageMs: number;
  model: string;
  kind: string;
  abortedLastRun: boolean;
}> {
  interface RawSession {
    key: string;
    sessionId: string;
    updatedAt: number;
    ageMs: number;
    model: string;
    kind?: string;
    abortedLastRun?: boolean;
  }

  let data: { sessions?: RawSession[] };
  try {
    data = JSON.parse(output);
  } catch {
    return [];
  }

  const sessions: RawSession[] = data.sessions ?? [];

  return sessions.map((s) => {
    // Key format: agent:{agentId}:{kind}[:{extra}]
    // e.g. "agent:main:main", "agent:main:cron:uuid"
    const keyParts = s.key.split(":");
    const agentId = keyParts[1] ?? "unknown";
    const kind = keyParts[2] ?? "direct";

    // Determine derived status
    let status: "active" | "idle" | "blocked" = "idle";
    if (s.abortedLastRun) status = "blocked";
    else if (s.ageMs < 90_000) status = "active";

    return {
      gateway,
      sessionKey: s.key,
      sessionId: s.sessionId,
      agentId,
      updatedAt: s.updatedAt,
      ageMs: s.ageMs,
      model: s.model,
      kind,
      abortedLastRun: s.abortedLastRun ?? false,
      status,
    };
  });
}

/** Map a session key to infer which team/gateway it belongs to */
export function inferTeamFromKey(key: string): string {
  if (key.includes(":cron:")) return "rafael";
  if (key.includes(":main:main")) return "aiona";
  if (key.includes("gabriel")) return "gabriel";
  return "aiona";
}
