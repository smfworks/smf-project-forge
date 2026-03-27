"use client";

import { useCallback, useState, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  Node,
  Edge,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Puzzle,
  Map,
  PenTool,
  Edit3,
  Rocket,
  Plus,
  Download,
  Maximize2,
  Layers,
  X,
  GripVertical,
} from "lucide-react";

// Custom node components
function IdeaNode({ data }: { data: { label: string; source: string; team: string } }) {
  const teamColors: Record<string, string> = {
    rafael: "#F59E0B",
    aiona: "#F97316",
    gabriel: "#14B8A6",
    default: "#3B82F6",
  };
  const color = teamColors[data.team as keyof typeof teamColors] || teamColors.default;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="px-4 py-3 rounded-xl border bg-[#111827] transition-all duration-200 hover:shadow-lg cursor-grab active:cursor-grabbing group"
      style={{ borderColor: `${color}40`, boxShadow: `0 0 12px ${color}20` }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color }} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate max-w-[160px]">{data.label}</p>
          {data.source && (
            <p className="text-[10px] text-[#64748B] mt-0.5">{data.source}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BubbleNode({ data }: { data: { label: string; team: string; childCount: number } }) {
  const teamColors: Record<string, string> = {
    rafael: "#F59E0B",
    aiona: "#F97316",
    gabriel: "#14B8A6",
    default: "#3B82F6",
  };
  const color = teamColors[data.team as keyof typeof teamColors] || teamColors.default;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="px-5 py-4 rounded-2xl border-2 bg-[#111827] transition-all duration-200 hover:shadow-2xl cursor-grab active:cursor-grabbing min-w-[180px]"
      style={{ borderColor: color, boxShadow: `0 0 20px ${color}25` }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Puzzle className="w-4 h-4" style={{ color }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>Bubble</span>
      </div>
      <p className="text-sm font-semibold">{data.label}</p>
      {data.childCount > 0 && (
        <p className="text-xs text-[#64748B] mt-1">{data.childCount} ideas</p>
      )}
    </motion.div>
  );
}

function ArtifactNode({ data }: { data: { label: string; type: string; status: string } }) {
  const statusColors: Record<string, string> = {
    draft: "#EAB308",
    edited: "#3B82F6",
    published: "#22C55E",
  };
  const color = statusColors[data.status as keyof typeof statusColors] || "#64748B";
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="px-4 py-3 rounded-xl border bg-[#111827] cursor-grab active:cursor-grabbing"
      style={{ borderColor: `${color}50` }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-xs text-[#64748B] uppercase tracking-wider">{data.type}</span>
      </div>
      <p className="text-sm font-medium mt-1">{data.label}</p>
    </motion.div>
  );
}

const nodeTypes: NodeTypes = {
  idea: IdeaNode,
  bubble: BubbleNode,
  artifact: ArtifactNode,
};

const PHASE_COLORS: Record<number, string> = {
  0: "#F59E0B",
  1: "#F97316",
  2: "#3B82F6",
  3: "#8B5CF6",
  4: "#06B6D4",
  5: "#22C55E",
};

const INITIAL_NODES: Node[] = [
  {
    id: "bubble-1",
    type: "bubble",
    position: { x: 350, y: 200 },
    data: { label: "AI Orchestration", team: "aiona", childCount: 5 },
  },
  {
    id: "idea-1",
    type: "idea",
    position: { x: 50, y: 80 },
    data: { label: "28-agent ecosystem", source: "radar", team: "rafael" },
  },
  {
    id: "idea-2",
    type: "idea",
    position: { x: 50, y: 160 },
    data: { label: "Multi-team coordination", source: "hunter", team: "aiona" },
  },
  {
    id: "idea-3",
    type: "idea",
    position: { x: 50, y: 240 },
    data: { label: "Phase-gate workflow", source: "historian", team: "gabriel" },
  },
  {
    id: "artifact-1",
    type: "artifact",
    position: { x: 650, y: 180 },
    data: { label: "Requirements v0.1", type: "Requirements", status: "edited" },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1-b1", source: "idea-1", target: "bubble-1", animated: true, style: { stroke: "#F59E0B", strokeWidth: 2 } },
  { id: "e2-b1", source: "idea-2", target: "bubble-1", animated: true, style: { stroke: "#F97316", strokeWidth: 2 } },
  { id: "e3-b1", source: "idea-3", target: "bubble-1", animated: true, style: { stroke: "#14B8A6", strokeWidth: 2 } },
  { id: "e-b1-a1", source: "bubble-1", target: "artifact-1", animated: true, style: { stroke: "#3B82F6", strokeWidth: 2 } },
];

function ForgeCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPos, setAddMenuPos] = useState({ x: 0, y: 0 });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeDoubleClick = useCallback((_e: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneDoubleClick = useCallback((e: React.MouseEvent) => {
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;
    setAddMenuPos({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    setShowAddMenu(true);
  }, []);

  const addNode = (type: "idea" | "bubble" | "artifact") => {
    const colors = ["rafael", "aiona", "gabriel"] as const;
    const randomTeam = colors[Math.floor(Math.random() * colors.length)];
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: addMenuPos,
      data:
        type === "idea"
          ? { label: "New idea", source: "manual", team: randomTeam }
          : type === "bubble"
          ? { label: "New bubble", team: randomTeam, childCount: 0 }
          : { label: "New artifact", type: "Document", status: "draft" },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowAddMenu(false);
  };

  return (
    <div ref={reactFlowWrapper} className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={() => setShowAddMenu(false)}
        onDoubleClick={onPaneDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        className="bg-[#0A0F1E]"
        style={{ background: "#0A0F1E" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1E293B" />
        <MiniMap
          nodeColor={(node) => {
            const n = node as Node<{ team?: string; status?: string }>;
            if (n.type === "bubble") return "#F97316";
            if (n.type === "artifact") return (n.data.status && { draft: "#EAB308", edited: "#3B82F6", published: "#22C55E" }[n.data.status]) || "#64748B";
            const teamColors: Record<string, string> = { rafael: "#F59E0B", aiona: "#F97316", gabriel: "#14B8A6" };
            return teamColors[n.data?.team as string] || "#3B82F6";
          }}
          maskColor="rgba(10, 15, 30, 0.8)"
          style={{ background: "#111827" }}
        />
        <Controls className="!rounded-xl !border !border-[#1E293B] !shadow-lg" />
        <Panel position="top-right" className="!m-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                const bounds = reactFlowWrapper.current?.getBoundingClientRect();
                if (!bounds) return;
                setAddMenuPos({ x: bounds.width / 2, y: bounds.height / 2 });
                setShowAddMenu(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-[#94A3B8] text-sm hover:bg-[#1E293B] transition-all">
              <Download className="w-4 h-4" />
              Export PNG
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Add node menu */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-50 glass rounded-xl border border-[#1E293B] p-2 shadow-2xl"
            style={{ top: addMenuPos.y + 10, left: addMenuPos.x + 10 }}
          >
            <div className="flex flex-col gap-1">
              {[
                { type: "idea" as const, label: "Idea Node", icon: Lightbulb, color: "#F59E0B" },
                { type: "bubble" as const, label: "Bubble Node", icon: Puzzle, color: "#F97316" },
                { type: "artifact" as const, label: "Artifact Node", icon: Map, color: "#3B82F6" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => addNode(item.type)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#E2E8F0] hover:bg-[#1E293B] transition-all text-left"
                >
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ForgeCanvas() {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <ForgeCanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
