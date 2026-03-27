"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AGENTS, TEAMS, getAgentsByTeam, type AgentConfig } from "@/lib/config";
import { useEffect, useState, useCallback } from "react";

// ── Live status from OpenClaw gateways ──────────────────────────────────────

interface AgentLiveStatus {
  id: string;
  status: "active" | "idle" | "blocked";
  currentTask?: string;
}

function useAgentStatuses() {
  const [statuses, setStatuses] = useState<Record<string, AgentLiveStatus>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/status");
      if (!res.ok) throw new Error("Failed");
      const data: AgentLiveStatus[] = await res.json();
      const map: Record<string, AgentLiveStatus> = {};
      for (const a of data) map[a.id] = a;
      setStatuses(map);
      setLastRefresh(new Date());
    } catch {
      // Silently fall back to empty — all agents show idle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 15000);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  return { statuses, lastRefresh, loading };
}

// ── Single agent card ─────────────────────────────────────────────────────────

function AgentCard({ agent, status }: { agent: AgentConfig; status?: AgentLiveStatus }) {
  const team = TEAMS[agent.team];
  const displayStatus = status?.status ?? "idle";
  const currentTask = status?.currentTask;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border p-4 transition-all duration-200 hover:shadow-lg group"
      style={{
        background: team.colorDim,
        borderColor: `${team.color}30`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: `${team.color}25`, color: team.color }}
          >
            {agent.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E2E8F0] leading-tight">
              {agent.name}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      {/* Current task — only shown if active */}
      {displayStatus === "active" && currentTask && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-2 px-2 py-1.5 rounded-lg bg-[#0A0F1E] border border-[#1E293B]"
        >
          <p className="text-[10px] text-[#64748B] leading-tight">
            <span className="text-[#22C55E] font-medium">→</span> {currentTask}
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <code className="text-[10px] font-mono text-[#475569] bg-[#0A0F1E] px-1.5 py-0.5 rounded overflow-hidden text-ellipsis">
          {agent.model}
        </code>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: `${team.color}15`, color: team.color }}
        >
          {team.label}
        </span>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: "active" | "idle" | "blocked" }) {
  const configs = {
    active: { color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)", label: "Active" },
    idle:   { color: "#64748B", bg: "rgba(100, 116, 139, 0.15)", label: "Idle" },
    blocked:{ color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)", label: "Blocked" },
  };
  const cfg = configs[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: cfg.color,
          animation: status === "active" ? "agent-pulse 2s ease-in-out infinite" : "none",
        }}
      />
      {cfg.label}
    </span>
  );
}

// ── Main roster component ─────────────────────────────────────────────────────

export function AgentRoster() {
  const { statuses, lastRefresh, loading } = useAgentStatuses();
  const teamOrder = ["rafael", "aiona", "gabriel"] as const;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Team</h1>
          <p className="text-[#64748B] text-sm mt-1">
            {AGENTS.length} agents across {teamOrder.length} teams
            {loading ? " · Connecting..." : ` · Updated ${lastRefresh.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Active count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E293B]">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs text-[#64748B]">
              {Object.values(statuses).filter((s) => s.status === "active").length} active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Team sections */}
      {teamOrder.map((teamKey, ti) => {
        const team = TEAMS[teamKey];
        const teamAgents = getAgentsByTeam(teamKey);

        return (
          <motion.div
            key={teamKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ti * 0.1 }}
          >
            {/* Team header */}
            <div
              className="flex items-center gap-3 mb-4 pb-3 border-b"
              style={{ borderColor: `${team.color}30` }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: team.color }}
              />
              <span className="font-semibold text-sm" style={{ color: team.color }}>
                {team.label}
              </span>
              <span className="text-xs text-[#64748B]">{team.sublabel}</span>
              <Badge
                variant="outline"
                className="text-xs border-[#1E293B] text-[#64748B] ml-auto"
              >
                {teamAgents.length} agents
              </Badge>
            </div>

            {/* Agent cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  status={statuses[agent.id]}
                />
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl border border-[#1E293B] bg-[#111827]/30 flex flex-wrap items-center gap-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-xs text-[#94A3B8]">Active — working on a task</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#64748B]" />
          <span className="text-xs text-[#94A3B8]">Idle — available on demand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span className="text-xs text-[#94A3B8]">Blocked — waiting on input</span>
        </div>
        <span className="ml-auto text-xs text-[#334155]">
          Edit <code className="text-[#475569]">lib/config.ts</code> to update roster
        </span>
      </motion.div>
    </div>
  );
}
