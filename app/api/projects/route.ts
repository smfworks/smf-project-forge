import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET /api/projects — List all projects
// POST /api/projects — Create a new project
export async function GET() {
  try {
    const db = getDb();
    const all = db.select().from(projects).all();
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

    const db = getDb();
    const now = new Date();
    const newProject = {
      id: randomUUID(),
      name,
      type,
      phase: 0,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    db.insert(projects).values(newProject).run();
    return NextResponse.json(newProject, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
