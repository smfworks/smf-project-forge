import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nodes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET /api/projects/[id]/nodes
// POST /api/projects/[id]/nodes
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = db.select().from(nodes).where(eq(nodes.projectId, id)).all();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { phase = 0, type = "idea", title, content, team, source, parentId, positionX = 0, positionY = 0 } = body;

    const newNode = {
      id: randomUUID(),
      projectId: id,
      phase,
      type,
      title: title || null,
      content: content || null,
      team: team || null,
      source: source || null,
      parentId: parentId || null,
      positionX,
      positionY,
      createdAt: new Date(),
    };

    db.insert(nodes).values(newNode).run();
    return NextResponse.json(newNode, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create node" }, { status: 500 });
  }
}
