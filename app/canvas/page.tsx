"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { ForgeCanvas } from "@/components/canvas/forge-canvas";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, FolderOpen, Layers, Save, Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  type: string;
  phase: number;
  status: string;
}

interface CanvasData {
  project: Project;
  nodes: unknown[];
  edges: unknown[];
  stats: { ideas: number; artifacts: number; customNodes: number };
}

const PHASE_LABELS = ["Discovery", "Direction", "Build", "Refine", "Launch", "Live"];
const PHASE_COLORS = ["#F59E0B", "#F97316", "#3B82F6", "#8B5CF6", "#06B6D4", "#22C55E"];

export default function CanvasPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  // Load all projects
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        // Auto-select first project if none selected
        if (data.length > 0 && !selectedProject) {
          selectProject(data[0]);
        }
      })
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectProject = async (project: Project) => {
    setSelectedProject(project);
    setLoading(true);
    try {
      const res = await fetch(`/api/canvas/${project.id}`);
      const data = await res.json();
      setCanvasData(data);
    } catch (e) {
      console.error("Failed to load canvas:", e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save canvas changes (debounced 2s)
  const handleCanvasChange = useCallback(
    (nodes: unknown[], edges: unknown[]) => {
      if (!selectedProject) return;
      const key = JSON.stringify({ nodes, edges });
      if (key === lastSavedRef.current) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await fetch(`/api/canvas/${selectedProject.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nodes, edges }),
          });
          lastSavedRef.current = key;
        } catch (e) {
          console.error("Failed to save canvas:", e);
        } finally {
          setSaving(false);
        }
      }, 2000);
    },
    [selectedProject]
  );

  // Create new project
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      const project = await res.json();
      setProjects((prev) => [project, ...prev]);
      setSelectedProject(project);
      setCanvasData({
        project,
        nodes: [],
        edges: [],
        stats: { ideas: 0, artifacts: 0, customNodes: 0 },
      });
      setNewProjectName("");
      setShowNewProject(false);
    } catch (e) {
      console.error("Failed to create project:", e);
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col">
      <TopNav />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col"
      >
        {/* Project tabs + header */}
        <div className="border-b border-[#1E293B]">
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 pt-3 overflow-x-auto">
            {projects.map((p) => {
              const isSelected = selectedProject?.id === p.id;
              const phaseColor = PHASE_COLORS[p.phase] || "#3B82F6";
              return (
                <button
                  key={p.id}
                  onClick={() => selectProject(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#111827] border-t border-x border-[#1E293B] text-white"
                      : "text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0F1629]"
                  }`}
                  style={isSelected ? { borderTopColor: phaseColor } : {}}
                >
                  <FolderOpen className="w-3.5 h-3.5" style={{ color: phaseColor }} />
                  {p.name}
                </button>
              );
            })}
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-t-lg text-sm font-medium text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0F1629] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          </div>

          {/* New project input */}
          <AnimatePresence>
            {showNewProject && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-3 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <input
                    autoFocus
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                    placeholder="Project name..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-[#475569] outline-none"
                  />
                  {creatingProject ? (
                    <Loader2 className="w-4 h-4 text-[#64748B] animate-spin" />
                  ) : (
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                      className="px-3 py-1 rounded-lg bg-[#3B82F6] text-white text-xs font-semibold disabled:opacity-40 hover:bg-[#2563EB] transition-all"
                    >
                      Create
                    </button>
                  )}
                  <button
                    onClick={() => { setShowNewProject(false); setNewProjectName(""); }}
                    className="p-1 rounded hover:bg-[#1E293B] transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-[#64748B]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected project info bar */}
          {selectedProject && (
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: PHASE_COLORS[selectedProject.phase] }}
                  />
                  <span className="text-xs font-medium text-white">{selectedProject.name}</span>
                  <span className="text-xs text-[#475569]">·</span>
                  <span className="text-xs text-[#64748B]">{PHASE_LABELS[selectedProject.phase]}</span>
                </div>
                {canvasData && (
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {canvasData.stats.ideas} ideas
                    </span>
                    <span>·</span>
                    <span>{canvasData.stats.artifacts} artifacts</span>
                    <span>·</span>
                    <span>{canvasData.stats.customNodes} custom</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {saving && (
                  <span className="flex items-center gap-1 text-xs text-[#64748B]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                )}
                {!saving && canvasData && (
                  <span className="text-xs text-[#22C55E]">Saved</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Canvas area */}
        <div className="flex-1 h-[calc(100vh-10rem)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            </div>
          ) : selectedProject && canvasData ? (
            <ForgeCanvas
              key={selectedProject.id}
              projectId={selectedProject.id}
              initialNodes={canvasData.nodes as never[]}
              initialEdges={canvasData.edges as never[]}
              onSave={(nodes, edges) => handleCanvasChange(nodes as unknown[], edges as unknown[])}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <FolderOpen className="w-12 h-12 text-[#1E293B]" />
              <p className="text-[#475569] text-sm">Select or create a project to start</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
