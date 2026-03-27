import { NextRequest, NextResponse } from "next/server";
import { listNodes, createNode } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const nodes = await listNodes(id);
    return NextResponse.json(nodes);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { phase = 0, type = "idea", title, content, team, source, parentId, positionX = 0, positionY = 0 } = body;
    const node = await createNode({ projectId: id, phase, type, title, content, team, source, parentId, positionX, positionY });
    return NextResponse.json(node, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create node" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
