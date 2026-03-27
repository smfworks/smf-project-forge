"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TEAM_COLORS = {
  rafael: { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-400", label: "Rafael — Ops & Coordination" },
  aiona: { bg: "bg-orange-500/20", border: "border-orange-500", text: "text-orange-400", label: "Aiona — Content & Writing" },
  gabriel: { bg: "bg-teal-500/20", border: "border-teal-500", text: "text-teal-400", label: "Gabriel — Research & Production" },
};

const AGENTS = [
  { id: "dwight-radar", name: "Dwight Radar", team: "rafael", role: "Scanner — external signal monitoring", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "morgan-manager", name: "Morgan Manager", team: "rafael", role: "Orchestration coordinator", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "fred-forge", name: "Fred Forge", team: "rafael", role: "Mission execution engine", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "sam-sage", name: "Sam Sage", team: "rafael", role: "Pattern extraction & lessons learned", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "allen-architect", name: "Allen Architect", team: "rafael", role: "Requirements & architecture", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "chad-approver", name: "Chad Approver", team: "rafael", role: "Gate keeper & approver", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "hunter-haley", name: "Hunter Haley", team: "aiona", role: "Content scout — trends & opportunities", model: "minimax-m2.7:cloud", status: "active" },
  { id: "quinn-writer", name: "Quinn Writer", team: "aiona", role: "Blog drafts & long-form content", model: "kimi-k2.5:cloud", status: "active" },
  { id: "vera-editor", name: "Vera Editor", team: "aiona", role: "Content review & editing", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "paige-analyst", name: "Paige Analyst", team: "aiona", role: "SEO optimization & keywords", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "dex-publisher", name: "Dex Publisher", team: "aiona", role: "CMS publishing & distribution", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "harold-historian", name: "Harold Historian", team: "gabriel", role: "Historical research", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "socrates-philosopher", name: "Socrates Philosopher", team: "gabriel", role: "Deep reasoning & ideation", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "chris-curator", name: "Chris Curator", team: "gabriel", role: "Knowledge organization", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "elena-educator", name: "Elena Educator", team: "gabriel", role: "Educational content design", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "samantha-scriptwriter", name: "Samantha ScriptWriter", team: "gabriel", role: "Script & narrative drafting", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "ned-narrator", name: "Ned Narrator", team: "gabriel", role: "Narrative flow specialist", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "veronica-voice", name: "Veronica Voice", team: "gabriel", role: "Audio content production", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "mary-formatter", name: "Mary Formatter", team: "gabriel", role: "Multi-format production", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "filo-factchecker", name: "Filo FactChecker", team: "gabriel", role: "Fact verification", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "patricia-qalead", name: "Patricia QALead", team: "gabriel", role: "Quality assurance lead", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "justin-edgecase", name: "Justin EdgeCase", team: "gabriel", role: "Edge case stress-testing", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "pamela-projectmanager", name: "Pamela ProjectManager", team: "gabriel", role: "Episode/project coordination", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "tracy-testaudience", name: "Tracy TestAudience", team: "gabriel", role: "Audience testing & feedback", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "edith-editor", name: "Edith Editor", team: "gabriel", role: "Deep editing passes", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "sophia-series", name: "Sophia Series", team: "gabriel", role: "Series structure & continuity", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "marcus-media", name: "Marcus Media", team: "gabriel", role: "Media integration", model: "minimax-m2.7:cloud", status: "idle" },
  { id: "olivia-outreach", name: "Olivia Outreach", team: "gabriel", role: "Community & partner outreach", model: "minimax-m2.7:cloud", status: "idle" },
];

export default function RosterPage() {
  const teams = ["rafael", "aiona", "gabriel"] as const;

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <header className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#0A0F1E]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[#94A3B8] hover:text-[#E2E8F0] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#0A0F1E"/>
              <path d="M8 24V8l6 8 6-8v16" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 12h4m0 0v10m0-10l-3 3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="8" r="3" fill="#14B8A6"/>
            </svg>
            <span className="font-semibold text-[#E2E8F0]">SMF Forge</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] text-sm font-medium transition-colors">
              Pipeline
            </Link>
            <Link href="/roster" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] text-sm font-medium">
              Roster
            </Link>
            <Link href="/canvas" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] text-sm font-medium transition-colors">
              Canvas
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#E2E8F0] mb-1">Agent Roster</h1>
          <p className="text-[#94A3B8] text-sm">28 specialized agents across 3 teams · Last refreshed just now</p>
        </div>

        {teams.map((team) => {
          const colors = TEAM_COLORS[team];
          const teamAgents = AGENTS.filter((a) => a.team === team);
          const activeCount = teamAgents.filter((a) => a.status === "active").length;

          return (
            <div key={team} className="mb-10">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1E293B]">
                <div className={`w-3 h-3 rounded-full ${team === "rafael" ? "bg-amber-500" : team === "aiona" ? "bg-orange-500" : "bg-teal-500"}`} />
                <h2 className={`font-semibold ${colors.text}`}>{colors.label}</h2>
                <Badge variant="outline" className="border-[#1E293B] text-[#94A3B8] text-xs">
                  {activeCount} active · {teamAgents.length} total
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamAgents.map((agent) => (
                  <div key={agent.id} className={`rounded-xl border p-4 ${colors.border} ${colors.bg} ${agent.status === "active" ? "opacity-100" : "opacity-70"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={`font-semibold text-sm ${colors.text}`}>{agent.name}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{agent.role}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${agent.status === "active" ? "bg-[#22C55E]/20 text-[#22C55E]" : "bg-[#94A3B8]/20 text-[#94A3B8]"}`}>
                        {agent.status}
                      </span>
                    </div>
                    <Badge variant="outline" className="border-[#1E293B] text-[#64748B] text-xs mt-2">
                      {agent.model}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-8 p-4 rounded-xl border border-[#1E293B] bg-[#111827]/50">
          <p className="text-xs text-[#94A3B8] mb-3 font-medium">STATUS LEGEND</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /><span className="text-xs text-[#94A3B8]">Active — working on a task</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#94A3B8]" /><span className="text-xs text-[#94A3B8]">Idle — available</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /><span className="text-xs text-[#94A3B8]">Blocked — waiting on input</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}
