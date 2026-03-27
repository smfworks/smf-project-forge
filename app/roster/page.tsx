"use client";

import { TopNav } from "@/components/layout/top-nav";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const TEAM_CONFIG = {
  rafael: { label: "Rafael", sublabel: "Ops & Coordination", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)" },
  aiona:  { label: "Aiona",  sublabel: "Content & Writing",  color: "#F97316", bg: "rgba(249, 115, 22, 0.1)", border: "rgba(249, 115, 22, 0.3)" },
  gabriel:{ label: "Gabriel",sublabel: "Research & Production",color: "#14B8A6", bg: "rgba(20, 184, 166, 0.1)", border: "rgba(20, 184, 166, 0.3)" },
};

const AGENTS = [
  // Rafael
  { id: "dwight-radar",        name: "Dwight Radar",        team: "rafael", role: "Scanner — external signal monitoring",           model: "minimax-m2.7:cloud" },
  { id: "morgan-manager",      name: "Morgan Manager",       team: "rafael", role: "Orchestration coordinator",                         model: "minimax-m2.7:cloud" },
  { id: "fred-forge",          name: "Fred Forge",           team: "rafael", role: "Mission execution engine",                         model: "minimax-m2.7:cloud" },
  { id: "sam-sage",            name: "Sam Sage",             team: "rafael", role: "Pattern extraction & lessons learned",              model: "minimax-m2.7:cloud" },
  { id: "allen-architect",     name: "Allen Architect",      team: "rafael", role: "Requirements & architecture",                       model: "minimax-m2.7:cloud" },
  { id: "chad-approver",       name: "Chad Approver",        team: "rafael", role: "Gate keeper & approver",                          model: "minimax-m2.7:cloud" },
  // Aiona
  { id: "hunter-haley",        name: "Hunter Haley",        team: "aiona",  role: "Content scout — trends & opportunities",             model: "minimax-m2.7:cloud" },
  { id: "quinn-writer",        name: "Quinn Writer",         team: "aiona",  role: "Blog drafts & long-form content",                  model: "kimi-k2.5:cloud" },
  { id: "vera-editor",         name: "Vera Editor",          team: "aiona",  role: "Content review & editing",                        model: "minimax-m2.7:cloud" },
  { id: "paige-analyst",       name: "Paige Analyst",        team: "aiona",  role: "SEO optimization & keywords",                      model: "minimax-m2.7:cloud" },
  { id: "dex-publisher",       name: "Dex Publisher",        team: "aiona",  role: "CMS publishing & distribution",                    model: "minimax-m2.7:cloud" },
  // Gabriel
  { id: "harold-historian",    name: "Harold Historian",      team: "gabriel",role: "Historical research",                             model: "minimax-m2.7:cloud" },
  { id: "socrates-philosopher",name: "Socrates Philosopher", team: "gabriel",role: "Deep reasoning & ideation",                       model: "minimax-m2.7:cloud" },
  { id: "chris-curator",       name: "Chris Curator",        team: "gabriel",role: "Knowledge organization",                          model: "minimax-m2.7:cloud" },
  { id: "elena-educator",      name: "Elena Educator",       team: "gabriel",role: "Educational content design",                       model: "minimax-m2.7:cloud" },
  { id: "samantha-scriptwriter",name:"Samantha ScriptWriter", team: "gabriel",role: "Script & narrative drafting",                     model: "minimax-m2.7:cloud" },
  { id: "ned-narrator",        name: "Ned Narrator",          team: "gabriel",role: "Narrative flow specialist",                       model: "minimax-m2.7:cloud" },
  { id: "veronica-voice",      name: "Veronica Voice",        team: "gabriel",role: "Audio content production",                         model: "minimax-m2.7:cloud" },
  { id: "mary-formatter",      name: "Mary Formatter",        team: "gabriel",role: "Multi-format production",                         model: "minimax-m2.7:cloud" },
  { id: "filo-factchecker",    name: "Filo FactChecker",      team: "gabriel",role: "Fact verification",                               model: "minimax-m2.7:cloud" },
  { id: "patricia-qalead",     name: "Patricia QALead",      team: "gabriel",role: "Quality assurance lead",                          model: "minimax-m2.7:cloud" },
  { id: "justin-edgecase",     name: "Justin EdgeCase",       team: "gabriel",role: "Edge case stress-testing",                        model: "minimax-m2.7:cloud" },
  { id: "pamela-projectmanager",name:"Pamela ProjectManager",  team: "gabriel",role: "Episode/project coordination",                     model: "minimax-m2.7:cloud" },
  { id: "tracy-testaudience",  name: "Tracy TestAudience",    team: "gabriel",role: "Audience testing & feedback",                     model: "minimax-m2.7:cloud" },
  { id: "edith-editor",         name: "Edith Editor",          team: "gabriel",role: "Deep editing passes",                              model: "minimax-m2.7:cloud" },
  { id: "sophia-series",       name: "Sophia Series",          team: "gabriel",role: "Series structure & continuity",                    model: "minimax-m2.7:cloud" },
  { id: "marcus-media",         name: "Marcus Media",          team: "gabriel",role: "Media integration",                                model: "minimax-m2.7:cloud" },
  { id: "olivia-outreach",     name: "Olivia Outreach",        team: "gabriel",role: "Community & partner outreach",                     model: "minimax-m2.7:cloud" },
];

// Polls the agent status from the API every 15s
function useAgentStatus() {
  const [statuses, setStatuses] = useState<Record<string, "active" | "idle" | "blocked">>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/agents/status");
        if (res.ok) {
          const data: Array<{ id: string; status: string }> = await res.json();
          const map: Record<string, "active" | "idle" | "blocked"> = {};
          for (const a of data) map[a.id] = a.status as "active" | "idle" | "blocked";
          setStatuses(map);
          setLastRefresh(new Date());
        }
      } catch {
        // Silently ignore — demo uses hardcoded statuses below
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return { statuses, lastRefresh };
}

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  const config = TEAM_CONFIG[agent.team as keyof typeof TEAM_CONFIG];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4 transition-all duration-200 hover:border-opacity-60 group cursor-default"
      style={{ background: config.bg, borderColor: config.border }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: `${config.color}25`, color: config.color }}
          >
            {agent.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#E2E8F0] leading-tight">{agent.name}</p>
          </div>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#1E293B] text-[#94A3B8]">
          {agent.team}
        </span>
      </div>
      <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{agent.role}</p>
      <div className="flex items-center justify-between">
        <code className="text-[10px] font-mono text-[#475569] bg-[#0A0F1E] px-1.5 py-0.5 rounded">
          {agent.model}
        </code>
      </div>
    </motion.div>
  );
}

export default function RosterPage() {
  const { statuses, lastRefresh } = useAgentStatus();

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <TopNav />
      <main className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Team</h1>
            <p className="text-[#64748B] text-sm mt-1">
              28 agents across three specialized teams · refreshed{" "}
              {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs text-[#64748B]">Live</span>
          </div>
        </motion.div>

        {/* Team sections */}
        {(Object.keys(TEAM_CONFIG) as Array<keyof typeof TEAM_CONFIG>).map((teamKey, ti) => {
          const config = TEAM_CONFIG[teamKey];
          const teamAgents = AGENTS.filter((a) => a.team === teamKey);
          return (
            <motion.div
              key={teamKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ti * 0.1 }}
              className="mb-10"
            >
              {/* Team header */}
              <div
                className="flex items-center gap-3 mb-4 pb-3 border-b"
                style={{ borderColor: config.border }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: config.color }} />
                <div>
                  <span className="font-semibold text-sm" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span className="text-[#64748B] text-xs ml-2">{config.sublabel}</span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs border-[#1E293B] text-[#64748B]"
                >
                  {teamAgents.length} agents
                </Badge>
              </div>

              {/* Agent cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Status legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-xl border border-[#1E293B] bg-[#111827]/30 flex flex-wrap gap-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-xs text-[#94A3B8]">Active — currently working</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#64748B]" />
            <span className="text-xs text-[#94A3B8]">Idle — available on demand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-xs text-[#94A3B8]">Blocked — waiting on input</span>
          </div>
          <div className="ml-auto text-xs text-[#334155]">
            Status powered by OpenClaw gateway
          </div>
        </motion.div>
      </main>
    </div>
  );
}
