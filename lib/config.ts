/**
 * SMF Project Forge — Configuration
 *
 * This file defines your agent ecosystem: all agents, their teams,
 * which OpenClaw gateway they run on, and how to reach them.
 *
 * Edit this file to add/remove agents, change team structure,
 * or point agents at different gateways.
 *
 * Live status is fetched from the OpenClaw gateway sessions API.
 */

export interface AgentConfig {
  id: string;
  name: string;
  team: string;          // Team key (matches TEAM_CONFIG below)
  role: string;          // Human-readable role description
  model: string;         // LLM model in use
  emoji: string;         // For avatar display
  gateway: string;       // Which gateway this agent runs on
}

export interface TeamConfig {
  key: string;
  label: string;
  sublabel: string;      // "Ops & Coordination" etc.
  color: string;         // Hex color for UI
  colorDim: string;      // Dimmed version for backgrounds
  gateway: string;       // OpenClaw gateway URL for this team
  primary: boolean;      // Is this a primary agent (Rafael/Aiona/Gabriel)?
}

// ── Team Definitions ─────────────────────────────────────────────────────────

export const TEAMS: Record<string, TeamConfig> = {
  rafael: {
    key: "rafael",
    label: "Rafael",
    sublabel: "Ops & Coordination",
    color: "#F59E0B",
    colorDim: "rgba(245, 158, 11, 0.1)",
    gateway: process.env.RAFAEL_GATEWAY_URL || "https://mikesai3.tail09297b.ts.net",
    primary: true,
  },
  aiona: {
    key: "aiona",
    label: "Aiona",
    sublabel: "Content & Writing",
    color: "#F97316",
    colorDim: "rgba(249, 115, 22, 0.1)",
    gateway: process.env.AIONA_GATEWAY_URL || "https://mikesai1.tail09297b.ts.net",
    primary: true,
  },
  gabriel: {
    key: "gabriel",
    label: "Gabriel",
    sublabel: "Research & Production",
    color: "#14B8A6",
    colorDim: "rgba(20, 184, 166, 0.1)",
    gateway: process.env.GABRIEL_GATEWAY_URL || "https://mikesai2.tail09297b.ts.net",
    primary: true,
  },
};

// ── Agent Definitions ────────────────────────────────────────────────────────

export const AGENTS: AgentConfig[] = [
  // ── Rafael — Ops & Coordination ─────────────────────────────────────────
  {
    id: "dwight-radar",
    name: "Dwight Radar",
    team: "rafael",
    role: "Scanner — monitors external signals (Reddit, HN, X, GitHub, news)",
    model: "minimax-m2.7:cloud",
    emoji: "📡",
    gateway: "rafael",
  },
  {
    id: "morgan-manager",
    name: "Morgan Manager",
    team: "rafael",
    role: "Orchestration coordinator — manages agent workflows and handoffs",
    model: "minimax-m2.7:cloud",
    emoji: "📋",
    gateway: "rafael",
  },
  {
    id: "allen-architect",
    name: "Allen Architect",
    team: "rafael",
    role: "Requirements & architecture — drafts project skeletons and ADRs",
    model: "minimax-m2.7:cloud",
    emoji: "🏗️",
    gateway: "rafael",
  },
  {
    id: "chad-approver",
    name: "Chad Approver",
    team: "rafael",
    role: "Gate keeper — enforces approval gates before phase transitions",
    model: "minimax-m2.7:cloud",
    emoji: "✅",
    gateway: "rafael",
  },
  {
    id: "fred-forge",
    name: "Fred Forge",
    team: "rafael",
    role: "Mission execution engine — runs task queues and produces artifacts",
    model: "minimax-m2.7:cloud",
    emoji: "⚒️",
    gateway: "rafael",
  },
  {
    id: "sam-sage",
    name: "Sam Sage",
    team: "rafael",
    role: "Pattern extraction & lessons learned — post-mortem analytics",
    model: "minimax-m2.7:cloud",
    emoji: "🧙",
    gateway: "rafael",
  },

  // ── Aiona — Content & Writing ───────────────────────────────────────────
  {
    id: "hunter-haley",
    name: "Hunter Haley",
    team: "aiona",
    role: "Content scout — identifies trends, opportunities, and content angles",
    model: "minimax-m2.7:cloud",
    emoji: "🔍",
    gateway: "aiona",
  },
  // Aiona Edge — primary agent (this is Michael's main AI assistant)
  {
    id: "aiona-edge",
    name: "Aiona Edge",
    team: "aiona",
    role: "Primary AI assistant to Michael — orchestration, writing, research, coordination",
    model: "minimax-m2.7:cloud",
    emoji: "🎯",
    gateway: "aiona",
  },
  {
    id: "quinn-writer",
    name: "Quinn Writer",
    team: "aiona",
    role: "Blog drafts & long-form content — produces written artifacts",
    model: "kimi-k2.5:cloud",
    emoji: "✍️",
    gateway: "aiona",
  },
  {
    id: "paige-analyst",
    name: "Paige Analyst",
    team: "aiona",
    role: "SEO optimization — keywords, meta descriptions, readibility scoring",
    model: "minimax-m2.7:cloud",
    emoji: "📊",
    gateway: "aiona",
  },
  {
    id: "vera-editor",
    name: "Vera Editor",
    team: "aiona",
    role: "Content review & editing — quality passes on all written work",
    model: "minimax-m2.7:cloud",
    emoji: "🔬",
    gateway: "aiona",
  },
  {
    id: "dex-publisher",
    name: "Dex Publisher",
    team: "aiona",
    role: "CMS publishing & distribution — pushes content to all platforms",
    model: "minimax-m2.7:cloud",
    emoji: "🚀",
    gateway: "aiona",
  },

  // ── Gabriel — Research & Production ────────────────────────────────────
  {
    id: "harold-historian",
    name: "Harold Historian",
    team: "gabriel",
    role: "Historical research — deep dives into past patterns and precedents",
    model: "minimax-m2.7:cloud",
    emoji: "📜",
    gateway: "gabriel",
  },
  {
    id: "socrates-philosopher",
    name: "Socrates Philosopher",
    team: "gabriel",
    role: "Deep reasoning — challenges assumptions and surfaces counter-arguments",
    model: "minimax-m2.7:cloud",
    emoji: "🏛️",
    gateway: "gabriel",
  },
  {
    id: "chris-curator",
    name: "Chris Curator",
    team: "gabriel",
    role: "Knowledge organization — structures and tags information for retrieval",
    model: "minimax-m2.7:cloud",
    emoji: "🗂️",
    gateway: "gabriel",
  },
  {
    id: "elena-educator",
    name: "Elena Educator",
    team: "gabriel",
    role: "Educational content design — shapes complex topics for learning",
    model: "minimax-m2.7:cloud",
    emoji: "🎓",
    gateway: "gabriel",
  },
  {
    id: "samantha-scriptwriter",
    name: "Samantha ScriptWriter",
    team: "gabriel",
    role: "Script & narrative drafting — produces video/podcast scripts",
    model: "minimax-m2.7:cloud",
    emoji: "🎬",
    gateway: "gabriel",
  },
  {
    id: "ned-narrator",
    name: "Ned Narrator",
    team: "gabriel",
    role: "Narrative flow specialist — ensures compelling storytelling structure",
    model: "minimax-m2.7:cloud",
    emoji: "🎭",
    gateway: "gabriel",
  },
  {
    id: "veronica-voice",
    name: "Veronica Voice",
    team: "gabriel",
    role: "Audio content production — generates podcast intros, summaries, voiceovers",
    model: "minimax-m2.7:cloud",
    emoji: "🎙️",
    gateway: "gabriel",
  },
  {
    id: "mary-formatter",
    name: "Mary Formatter",
    team: "gabriel",
    role: "Multi-format production — adapts content across formats (video, audio, text)",
    model: "minimax-m2.7:cloud",
    emoji: "🎨",
    gateway: "gabriel",
  },
  {
    id: "filo-factchecker",
    name: "Filo FactChecker",
    team: "gabriel",
    role: "Fact verification — cross-references claims against sources",
    model: "minimax-m2.7:cloud",
    emoji: "🔎",
    gateway: "gabriel",
  },
  {
    id: "patricia-qalead",
    name: "Patricia QALead",
    team: "gabriel",
    role: "Quality assurance lead — final approval before publication",
    model: "minimax-m2.7:cloud",
    emoji: "🛡️",
    gateway: "gabriel",
  },
  {
    id: "justin-edgecase",
    name: "Justin EdgeCase",
    team: "gabriel",
    role: "Edge case stress-testing — finds weaknesses and failure modes",
    model: "minimax-m2.7:cloud",
    emoji: "💥",
    gateway: "gabriel",
  },
  {
    id: "pamela-projectmanager",
    name: "Pamela ProjectManager",
    team: "gabriel",
    role: "Episode/project coordination — keeps multi-part productions on track",
    model: "minimax-m2.7:cloud",
    emoji: "📌",
    gateway: "gabriel",
  },
  {
    id: "tracy-testaudience",
    name: "Tracy TestAudience",
    team: "gabriel",
    role: "Audience testing & feedback — validates content before final publish",
    model: "minimax-m2.7:cloud",
    emoji: "👥",
    gateway: "gabriel",
  },
  {
    id: "edith-editor",
    name: "Edith Editor",
    team: "gabriel",
    role: "Deep editing passes — structural refinement and polish",
    model: "minimax-m2.7:cloud",
    emoji: "✂️",
    gateway: "gabriel",
  },
  {
    id: "sophia-series",
    name: "Sophia Series",
    team: "gabriel",
    role: "Series structure & continuity — manages multi-episode content arcs",
    model: "minimax-m2.7:cloud",
    emoji: "🔗",
    gateway: "gabriel",
  },
  {
    id: "marcus-media",
    name: "Marcus Media",
    team: "gabriel",
    role: "Media integration — connects visual and audio assets into content",
    model: "minimax-m2.7:cloud",
    emoji: "🖼️",
    gateway: "gabriel",
  },
  {
    id: "olivia-outreach",
    name: "Olivia Outreach",
    team: "gabriel",
    role: "Community & partner outreach — manages external collaborations",
    model: "minimax-m2.7:cloud",
    emoji: "🤝",
    gateway: "gabriel",
  },
];

// ── Helper lookups ────────────────────────────────────────────────────────────

export function getAgentsByTeam(team: string): AgentConfig[] {
  return AGENTS.filter((a) => a.team === team);
}

export function getTeamConfig(team: string): TeamConfig | undefined {
  return TEAMS[team];
}

export function getPrimaryTeams(): TeamConfig[] {
  return Object.values(TEAMS).filter((t) => t.primary);
}
