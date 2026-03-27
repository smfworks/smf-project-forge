import { NextResponse } from "next/server";
import { getProject, listNodes, listArtifacts, listCanvasNodes, listCanvasEdges } from "@/lib/db";
import { upsertCanvasNode, upsertCanvasEdge } from "@/lib/db";

// GET /api/canvas/[projectId]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [nodes, artifacts, canvasNodes, canvasEdges] = await Promise.all([
      listNodes(projectId),
      listArtifacts(projectId),
      listCanvasNodes(projectId),
      listCanvasEdges(projectId),
    ]);

    const phaseColors = ["#F59E0B", "#F97316", "#3B82F6", "#8B5CF6", "#06B6D4", "#22C55E"];
    const teamColors: Record<string, string> = { rafael: "#F59E0B", aiona: "#F97316", gabriel: "#14B8A6" };

    const rfNodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }> = [];
    rfNodes.push({ id: `bubble-${projectId}`, type: "bubble", position: { x: 350, y: 200 }, data: { label: project.name, team: project.name, childCount: nodes.length + artifacts.length } });

    nodes.forEach((n, i) => {
      const saved = canvasNodes.find((cn) => cn.id === n.id);
      rfNodes.push({ id: n.id, type: "idea", position: { x: saved?.positionX ?? 50 + (i % 3) * 200, y: saved?.positionY ?? 50 + Math.floor(i / 3) * 100 }, data: { label: n.title || "Untitled", team: n.team || project.name, source: n.source || "agent", color: phaseColors[n.phase] || "#3B82F6" } });
    });

    artifacts.forEach((a, i) => {
      const saved = canvasNodes.find((cn) => cn.id === a.id);
      rfNodes.push({ id: a.id, type: "artifact", position: { x: saved?.positionX ?? 650, y: saved?.positionY ?? 150 + i * 80 }, data: { label: a.title, type: a.type, status: a.status } });
    });

    canvasNodes.filter((cn) => !nodes.find((n) => n.id === cn.id) && !artifacts.find((a) => a.id === cn.id)).forEach((cn) => {
      rfNodes.push({ id: cn.id, type: cn.nodeType, position: { x: cn.positionX, y: cn.positionY }, data: { label: cn.label, team: cn.team || project.name, source: cn.source || "manual" } });
    });

    const rfEdges: Array<{ id: string; source: string; target: string; animated?: boolean; style?: Record<string, string> }> = [];
    nodes.forEach((n) => {
      rfEdges.push({ id: `e-${n.id}-b`, source: n.id, target: `bubble-${projectId}`, animated: true, style: { stroke: teamColors[project.name] || "#3B82F6", strokeWidth: "2" } });
    });
    canvasEdges.forEach((e) => {
      rfEdges.push({ id: e.id, source: e.source, target: e.target, animated: true, style: { stroke: "#64748B", strokeWidth: "2" } });
    });

    return NextResponse.json({ project, nodes: rfNodes, edges: rfEdges, stats: { ideas: nodes.length, artifacts: artifacts.length, customNodes: canvasNodes.filter((cn) => !nodes.find((n) => n.id === cn.id) && !artifacts.find((a) => a.id === cn.id)).length } });
  } catch (err) {
    console.error("[forge] canvas GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/canvas/[projectId]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { nodes, edges } = body as {
      nodes: Array<{ id: string; position: { x: number; y: number }; type: string; data: Record<string, unknown> }>;
      edges: Array<{ id: string; source: string; target: string }>;
    };

    if (nodes?.length) {
      for (const n of nodes) {
        await upsertCanvasNode({ id: n.id, projectId, nodeType: n.type || "idea", label: (n.data?.label as string) || "Untitled", team: n.data?.team as string | undefined, source: n.data?.source as string | undefined, positionX: n.position.x, positionY: n.position.y });
      }
    }

    if (edges?.length) {
      for (const e of edges) {
        await upsertCanvasEdge({ id: e.id, projectId, source: e.source, target: e.target });
      }
    }

    return NextResponse.json({ ok: true, savedAt: Date.now() });
  } catch (err) {
    console.error("[forge] canvas PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
