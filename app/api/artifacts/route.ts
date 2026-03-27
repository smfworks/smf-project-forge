import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artifacts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET /api/artifacts?projectId=xxx
// POST /api/artifacts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  try {
    if (projectId) {
      const result = db.select().from(artifacts).where(eq(artifacts.projectId, projectId)).all();
      return NextResponse.json(result);
    }
    const result = db.select().from(artifacts).all();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch artifacts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, phase = 0, type, title, content, gdocUrl, localPath, agentId } = body;

    if (!projectId || !type || !title) {
      return NextResponse.json({ error: "projectId, type, and title are required" }, { status: 400 });
    }

    const now = new Date();
    const newArtifact = {
      id: randomUUID(),
      projectId,
      phase,
      type,
      title,
      content: content || null,
      gdocUrl: gdocUrl || null,
      localPath: localPath || null,
      agentId: agentId || null,
      version: 1,
      status: "draft" as const,
      createdAt: now,
      updatedAt: now,
    };

    db.insert(artifacts).values(newArtifact).run();
    return NextResponse.json(newArtifact, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create artifact" }, { status: 500 });
  }
}
