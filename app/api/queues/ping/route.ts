import { NextRequest, NextResponse } from "next/server";

// POST /api/queues/ping — called by sync daemon when a queue file changes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { machine, queue, action, entry, timestamp } = body;
    console.log(`[queue:sync] machine=${machine} queue=${queue} action=${action} ts=${timestamp}`);
    if (!machine || !queue) {
      return NextResponse.json({ error: "machine and queue are required" }, { status: 400 });
    }
    // TODO (Phase 2): Store in Turso queue_events table
    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process queue ping" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
