"use client";

import { TopNav } from "@/components/layout/top-nav";
import { AgentRoster } from "@/components/agents/agent-roster";
import { motion } from "framer-motion";

export default function RosterPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <TopNav />
      <main className="p-6 max-w-[1400px] mx-auto">
        <AgentRoster />
      </main>
    </div>
  );
}
