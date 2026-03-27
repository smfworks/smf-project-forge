import { NextResponse } from "next/server";
import { upsertCanvasNode, deleteCanvasNode, upsertCanvasEdge, deleteCanvasEdge } from "@/lib/db";

// PUT /api/canvas/[projectId]
// Save canvas state: upsert nodes, upsert edges, delete removed items
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { nodes, edges } = body as {
      nodes: Array<{
        id: string;
        position: { x: number; y: number };
        type: string;
        data: Record<string, unknown>;
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
      }>;
    };

    // Upsert all nodes
    if (nodes?.length) {
      for (const n of nodes) {
        await upsertCanvasNode({
          id: n.id,
          projectId,
          nodeType: n.type || "idea",
          label: (n.data?.label as string) || "Untitled",
          team: n.data?.team as string | undefined,
          source: n.data?.source as string | undefined,
          positionX: n.position.x,
          positionY: n.position.y,
        });
      }
    }

    // Upsert all edges
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
