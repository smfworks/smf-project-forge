import { NextRequest, NextResponse } from "next/server";

// POST /api/queues/heartbeat — called by sync daemon on machine boot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { machine, queues, timestamp } = body;
    console.log(`[heartbeat] machine=${machine} queues=${queues?.join(",")} ts=${timestamp}`);
    return NextResponse.json({ success: true, registered: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process heartbeat" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
