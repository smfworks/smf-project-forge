"use client";

import { TopNav } from "@/components/layout/top-nav";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Code,
  Mic,
  Video,
  ExternalLink,
  Clock,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

const ARTIFACTS = [
  { id: "1", title: "Requirements — AI Orchestration Series", type: "requirements", version: 3, status: "edited", agent: "Allen Architect", createdAt: "2026-03-25", phase: 2 },
  { id: "2", title: "ADR — Architecture Decision Record", type: "adr", version: 1, status: "draft", agent: "Allen Architect", createdAt: "2026-03-25", phase: 2 },
  { id: "3", title: "SEO Brief — The New Age of AI Orchestration", type: "blog_draft", version: 4, status: "published", agent: "Paige Analyst", createdAt: "2026-03-22", phase: 5 },
  { id: "4", title: "The New Age of AI Orchestration (Post)", type: "blog_draft", version: 6, status: "published", agent: "Quinn Writer", createdAt: "2026-03-22", phase: 5 },
  { id: "5", title: "Newsletter Issue #8", type: "blog_draft", version: 2, status: "published", agent: "Quinn Writer", createdAt: "2026-03-20", phase: 5 },
  { id: "6", title: "Audio Intro — Great Thinkers Episode 4", type: "audio", version: 2, status: "edited", agent: "Veronica Voice", createdAt: "2026-03-24", phase: 4 },
];

const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  requirements: { icon: FileText, color: "#3B82F6", label: "Requirements" },
  adr: { icon: GitBranch, color: "#8B5CF6", label: "ADR" },
  blog_draft: { icon: FileText, color: "#F97316", label: "Blog Draft" },
  code: { icon: Code, color: "#22C55E", label: "Code" },
  audio: { icon: Mic, color: "#EC4899", label: "Audio" },
  video: { icon: Video, color: "#06B6D4", label: "Video" },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  draft: { color: "#EAB308", bg: "rgba(234, 179, 8, 0.15)", icon: Clock },
  edited: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)", icon: CheckCircle2 },
  published: { color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)", icon: CheckCircle2 },
};

export default function ArtifactsPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <TopNav />
      <main className="p-6 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight">Artifact Vault</h1>
          <p className="text-[#64748B] text-sm mt-1">
            All project artifacts, versioned and organized by phase
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          {["All", "Requirements", "Drafts", "Published"].map((filter) => (
            <button
              key={filter}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#111827] border border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] transition-all"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Artifact table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1E293B] overflow-hidden bg-[#111827]/40"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-5 py-4">Artifact</th>
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-5 py-4">Type</th>
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-5 py-4">Agent</th>
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-5 py-4">Version</th>
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider px-5 py-4">Date</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {ARTIFACTS.map((artifact, i) => {
                const typeConfig = TYPE_CONFIG[artifact.type] || TYPE_CONFIG.blog_draft;
                const statusConfig = STATUS_CONFIG[artifact.status];
                const TypeIcon = typeConfig.icon;
                return (
                  <motion.tr
                    key={artifact.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${typeConfig.color}20` }}>
                          <TypeIcon className="w-4 h-4" style={{ color: typeConfig.color }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{artifact.title}</div>
                          <div className="text-xs text-[#64748B]">Phase {artifact.phase}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium" style={{ color: typeConfig.color }}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#94A3B8]">{artifact.agent}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono text-[#64748B]">v{artifact.version}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                        style={{ background: statusConfig.bg, color: statusConfig.color }}
                      >
                        <statusConfig.icon className="w-3 h-3" />
                        {artifact.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#64748B]">{artifact.createdAt}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#1E293B] transition-all">
                        <ExternalLink className="w-4 h-4 text-[#64748B]" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </main>
    </div>
  );
}
