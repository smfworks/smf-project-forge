import { NextRequest, NextResponse } from "next/server";

// POST /api/queues/ping — called by sync daemon when a queue file changes
// Body: { machine, queue, action, entry, timestamp }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { machine, queue, action, entry, timestamp } = body;

    // Log for now — will store in Turso queue tables in Phase 2
    console.log(`[queue:sync] machine=${machine} queue=${queue} action=${action} ts=${timestamp}`);

    if (!machine || !queue) {
      return NextResponse.json({ error: "machine and queue are required" }, { status: 400 });
    }

    // TODO (Phase 2): Store in Turso queue_events table
    // For now, acknowledge receipt
    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process queue ping" }, { status: 500 });
  }
}
