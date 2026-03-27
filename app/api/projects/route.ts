import { NextRequest, NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/projects
export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type = "other", description } = body;
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }
    const project = await createProject({ name, type, description });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
