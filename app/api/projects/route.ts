import { NextRequest, NextResponse } from "next/server";
import { listProjects, createProject } from "@/lib/db";

export async function GET() {
  try {
    const all = await listProjects();
    return NextResponse.json(all);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type = "other" } = body;
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }
    const project = await createProject({ name, type });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
