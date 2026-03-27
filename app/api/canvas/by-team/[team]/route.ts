import { NextResponse } from "next/server";
import { getProject, listCanvasNodes, listCanvasEdges } from "@/lib/db";
import { upsertCanvasNode, deleteCanvasNode } from "@/lib/db";

// GET /api/canvas/by-team/[team]
// Returns canvas data for a team's project by team name (rafael | aiona | gabriel)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ team: string }> }
) {
  try {
    const { team } = await params;
    const { listProjects } = await import("@/lib/db");
    const projects = await listProjects();
    const project = projects.find((p) => p.name === team || p.id === team);
    if (!project) {
      return NextResponse.json({ error: "Team project not found" }, { status: 404 });
    }

    const { listNodes, listArtifacts } = await import("@/lib/db");
    const [nodes, artifacts, canvasNodes, canvasEdges] = await Promise.all([
      listNodes(project.id),
      listArtifacts(project.id),
      listCanvasNodes(project.id),
      listCanvasEdges(project.id),
    ]);

    // Build React Flow nodes
    const phaseColors = ["#F59E0B", "#F97316", "#3B82F6", "#8B5CF6", "#06B6D4", "#22C55E"];
    const teamColors: Record<string, string> = { rafael: "#F59E0B", aiona: "#F97316", gabriel: "#14B8A6" };

    const rfNodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }> = [];

    // Team bubble
    rfNodes.push({
      id: `bubble-${project.id}`,
      type: "bubble",
      position: { x: 350, y: 200 },
      data: { label: project.name, team, childCount: nodes.length + artifacts.length },
    });

    // Project nodes → ideas
    nodes.forEach((n, i) => {
      rfNodes.push({
        id: n.id,
        type: "idea",
        position: { x: 50 + (i % 3) * 200, y: 50 + Math.floor(i / 3) * 100 },
        data: { label: n.title || "Untitled", team: n.team || team, source: n.source || "agent", color: phaseColors[n.phase] },
      });
    });

    // Artifacts
    artifacts.forEach((a, i) => {
      rfNodes.push({
        id: a.id,
        type: "artifact",
        position: { x: 650, y: 150 + i * 80 },
        data: { label: a.title, type: a.type, status: a.status },
      });
    });

    // Custom nodes
    canvasNodes.filter((cn) => !nodes.find((n) => n.id === cn.id) && !artifacts.find((a) => a.id === cn.id)).forEach((cn) => {
      rfNodes.push({ id: cn.id, type: cn.nodeType, position: { x: cn.positionX, y: cn.positionY }, data: { label: cn.label, team: cn.team || team, source: cn.source || "manual" } });
    });

    // Edges
    const rfEdges: Array<{ id: string; source: string; target: string; animated?: boolean; style?: Record<string, string> }> = [];
    nodes.forEach((n) => {
      rfEdges.push({ id: `e-${n.id}-b`, source: n.id, target: `bubble-${project.id}`, animated: true, style: { stroke: teamColors[team] || "#3B82F6", strokeWidth: "2" } });
    });

    return NextResponse.json({ project, nodes: rfNodes, edges: rfEdges });
  } catch (err) {
    console.error("[forge] canvas team GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
