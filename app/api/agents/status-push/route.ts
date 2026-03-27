/**
 * POST /api/agents/status-push
 *
 * Called by the gateway push script on each machine (mikesai1, mikesai2, mikesai3).
 * Authenticates via FORGE_API_KEY header.
 *
 * Body: { gateway: string, sessions: Session[] }
 * Each session: { key, sessionId, updatedAt, ageMs, model, kind, abortedLastRun }
 */
import { upsertAgentStatusCache } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Authenticate
  const apiKey = req.headers.get("x-forge-api-key") ?? "";
  if (apiKey !== (process.env.FORGE_API_KEY ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    gateway: string;
    sessions: Array<{
      key: string;
      sessionId: string;
      updatedAt: number;
      ageMs: number;
      model: string;
      kind: string;
      abortedLastRun: boolean;
    }>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { gateway, sessions } = body;

  // Derive status from age + aborted flag
  const entries = sessions.map((s) => {
    let status: "active" | "idle" | "blocked" = "idle";
    if (s.abortedLastRun) status = "blocked";
    else if (s.ageMs < 90_000) status = "active";

    // Extract agentId from key (format: agent:{id}:{kind}[:{extra}])
    const parts = s.key.split(":");
    const agentId = parts[1] ?? "unknown";

    return {
      gateway,
      sessionKey: s.key,
      sessionId: s.sessionId,
      agentId,
      model: s.model ?? "",
      kind: s.kind ?? "direct",
      status,
      updatedAt: s.updatedAt,
    };
  });

  try {
    await upsertAgentStatusCache(entries);
  } catch (err) {
    console.error("[forge] Failed to upsert agent status:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: entries.length });
}
