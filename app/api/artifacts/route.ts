import { NextRequest, NextResponse } from "next/server";
import { listArtifacts, createArtifact } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  try {
    const artifacts = await listArtifacts(projectId || undefined);
    return NextResponse.json(artifacts);
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
    const artifact = await createArtifact({ projectId, phase, type, title, content, gdocUrl, localPath, agentId });
    return NextResponse.json(artifact, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create artifact" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
