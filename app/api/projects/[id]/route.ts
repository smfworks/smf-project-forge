import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/projects/[id]
// PATCH /api/projects/[id] — update phase, status
// DELETE /api/projects/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = db.select().from(projects).where(eq(projects.id, id)).get();
    if (!result) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { phase, status, name } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (phase !== undefined) updates.phase = phase;
    if (status !== undefined) updates.status = status;
    if (name !== undefined) updates.name = name;

    db.update(projects).set(updates).where(eq(projects.id, id)).run();
    const updated = db.select().from(projects).where(eq(projects.id, id)).get();
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    db.delete(projects).where(eq(projects.id, id)).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
