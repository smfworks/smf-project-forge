"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Puzzle,
  Map,
  PenTool,
  Edit3,
  Rocket,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

const PHASES = [
  {
    id: 0,
    name: "Brainstorm",
    description: "Surface every possible thought without judgment",
    icon: Lightbulb,
    color: "#F59E0B",
    colorDim: "rgba(245, 158, 11, 0.15)",
    agents: ["Dwight Radar", "Hunter Haley", "Harold Historian"],
  },
  {
    id: 1,
    name: "Organize",
    description: "Collapse chaos into coherent bubbles",
    icon: Puzzle,
    color: "#F97316",
    colorDim: "rgba(249, 115, 22, 0.15)",
    agents: ["Allen Architect", "Quinn Writer", "Chris Curator"],
  },
  {
    id: 2,
    name: "Order & Map Out",
    description: "Turn the map into actionable artifacts",
    icon: Map,
    color: "#3B82F6",
    colorDim: "rgba(59, 130, 246, 0.15)",
    agents: ["Allen Architect", "Chad Approver", "Paige Analyst"],
  },
  {
    id: 3,
    name: "Rough Drafts",
    description: "Create multiple living drafts in parallel",
    icon: PenTool,
    color: "#8B5CF6",
    colorDim: "rgba(139, 92, 246, 0.15)",
    agents: ["Fred Forge", "Quinn Writer", "Veronica Voice"],
  },
  {
    id: 4,
    name: "Edit",
    description: "Multi-layer review and iteration",
    icon: Edit3,
    color: "#06B6D4",
    colorDim: "rgba(6, 182, 212, 0.15)",
    agents: ["Vera Editor", "Filo FactChecker", "Patricia QALead"],
  },
  {
    id: 5,
    name: "Final Draft",
    description: "Lock and launch",
    icon: Rocket,
    color: "#22C55E",
    colorDim: "rgba(34, 197, 94, 0.15)",
    agents: ["Dex Publisher", "Sam Sage", "Tracy TestAudience"],
  },
];

interface PhaseLaneProps {
  phase: (typeof PHASES)[number];
  state: "completed" | "active" | "upcoming";
  projectPhase: number;
  onAdvance?: () => void;
}

function PhaseLane({ phase, state, projectPhase, onAdvance }: PhaseLaneProps) {
  const isCompleted = state === "completed";
  const isActive = state === "active";
  const Icon = phase.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: phase.id * 0.1 }}
      className={cn(
        "relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300",
        isActive
          ? "border-[#1E293B] bg-[#111827] shadow-lg shadow-black/20"
          : isCompleted
          ? "border-[#1E293B]/50 bg-[#111827]/40"
          : "border-[#1E293B]/30 bg-[#111827]/20"
      )}
    >
      {/* Top color bar */}
      <div
        className="h-1 w-full"
        style={{
          background: isCompleted
            ? phase.color
            : isActive
            ? `linear-gradient(90deg, ${phase.color} 0%, ${phase.color}66 100%)`
            : "#1E293B",
        }}
      />

      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform"
              style={{
                background: isActive || isCompleted ? phase.colorDim : "rgba(30, 41, 59, 0.5)",
                border: `1px solid ${isActive || isCompleted ? phase.color + "40" : "#1E293B"}`,
              }}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: phase.color }} />
              ) : isActive ? (
                <Icon className="w-5 h-5" style={{ color: phase.color }} />
              ) : (
                <Circle className="w-5 h-5 text-[#334155]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isActive ? "text-[#64748B]" : "text-[#334155]"
                  )}
                >
                  Phase {phase.id + 1}
                </span>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#3B82F6]/20 text-[#3B82F6]">
                    Active
                  </span>
                )}
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: phase.colorDim, color: phase.color }}>
                    Done
                  </span>
                )}
              </div>
              <h3 className={cn("font-semibold text-base mt-0.5", isActive ? "text-[#E2E8F0]" : "text-[#64748B]")}>
                {phase.name}
              </h3>
            </div>
          </div>

          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full"
              style={{ background: phase.color }}
            />
          )}
        </div>

        {/* Description */}
        <p className={cn("text-sm leading-relaxed", isActive ? "text-[#94A3B8]" : "text-[#475569]")}>
          {phase.description}
        </p>

        {/* Agents */}
        <div className="flex flex-wrap gap-1.5">
          {phase.agents.map((agent) => (
            <span
              key={agent}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium"
              style={{
                background: isActive ? phase.colorDim : "rgba(30, 41, 59, 0.5)",
                color: isActive ? phase.color : "#475569",
              }}
            >
              {agent}
            </span>
          ))}
        </div>

        {/* Advance button — only on active phase */}
        {isActive && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={onAdvance}
            className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group"
            style={{
              background: `linear-gradient(135deg, ${phase.color} 0%, ${phase.color}CC 100%)`,
              boxShadow: `0 4px 14px ${phase.color}33`,
            }}
          >
            Advance to Next Phase
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        )}

        {/* Progress indicator for completed */}
        {isCompleted && (
          <div className="mt-2 flex items-center gap-2 text-[#22C55E] text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface PhaseGateDashboardProps {
  currentPhase?: number;
  projectName?: string;
  onPhaseAdvance?: (phase: number) => void;
}

export function PhaseGateDashboard({
  currentPhase = 0,
  projectName = "Untitled Project",
  onPhaseAdvance,
}: PhaseGateDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Project header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {projectName}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Six-phase creative production pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">
              {Math.round(((currentPhase) / 5) * 100)}% complete
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentPhase / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(90deg, #F59E0B, #F97316, #14B8A6, #3B82F6, #22C55E)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Phase lanes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PHASES.map((phase) => {
          let state: "completed" | "active" | "upcoming" = "upcoming";
          if (phase.id < currentPhase) state = "completed";
          else if (phase.id === currentPhase) state = "active";

          return (
            <PhaseLane
              key={phase.id}
              phase={phase}
              state={state}
              projectPhase={currentPhase}
              onAdvance={() => onPhaseAdvance?.(phase.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
