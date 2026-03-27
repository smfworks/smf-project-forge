import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    return NextResponse.json(allProjects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    // Return demo data if DB not configured
    return NextResponse.json([
      {
        id: "demo",
        name: "AI Orchestration Series",
        type: "blog",
        phase: 2,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "name and type required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(projects).values({
      id,
      name,
      type,
      description,
      phase: 0,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id, name, type, phase: 0, status: "active", createdAt: now, updatedAt: now });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
