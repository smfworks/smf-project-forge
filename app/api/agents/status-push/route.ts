import { NextRequest, NextResponse } from "next/server";
import { upsertAgentStatusCache } from "@/lib/db";
import { parseSessionsOutput } from "@/lib/gateway";
import { createGunzip } from "zlib";

// POST /api/agents/status-push
// Machines call this to push their openclaw sessions JSON to Forge
export async function POST(req: NextRequest) {
  // Authenticate via FORGE_API_KEY header
  const apiKey = req.headers.get("x-forge-api-key");
  if (!apiKey || apiKey !== process.env.FORGE_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentEncoding = req.headers.get("content-encoding") ?? "";
    let body: string;

    if (contentEncoding === "gzip") {
      // Decompress gzip payload
      const buffer = await req.arrayBuffer();
      body = await new Promise<string>((resolve, reject) => {
        const gzip = createGunzip();
        const chunks: Buffer[] = [];
        gzip.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        gzip.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        gzip.on("error", reject);
        gzip.end(Buffer.from(buffer));
      });
    } else {
      body = await req.text();
    }

    const { gateway, sessions } = JSON.parse(body) as { gateway: string; sessions: string };

    if (!gateway || !sessions) {
      return NextResponse.json({ error: "Missing gateway or sessions" }, { status: 400 });
    }

    // Parse the openclaw sessions --json output
    const parsed = parseSessionsOutput(gateway, sessions);

    // Convert to cache entries — derive status from age + abort flag
    const entries = parsed.map((s) => {
      let status: "active" | "idle" | "blocked" = "idle";
      if (s.abortedLastRun) status = "blocked";
      else if (s.ageMs < 90_000) status = "active";
      return {
        gateway,
        sessionKey: s.sessionKey,
        sessionId: s.sessionId,
        agentId: s.agentId,
        model: s.model,
        kind: s.kind,
        status,
        updatedAt: s.updatedAt,
      };
    });

    await upsertAgentStatusCache(entries);

    return NextResponse.json({ ok: true, count: entries.length });
  } catch (err) {
    console.error("[forge] status-push error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
