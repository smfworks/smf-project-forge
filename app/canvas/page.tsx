"use client";

import { TopNav } from "@/components/layout/top-nav";
import { ForgeCanvas } from "@/components/canvas/forge-canvas";
import { motion } from "framer-motion";

export default function CanvasPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col">
      <TopNav />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col"
      >
        {/* Canvas header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
          <div>
            <h2 className="text-sm font-semibold">Mind-Map Canvas</h2>
            <p className="text-xs text-[#64748B]">Double-click to add nodes · Drag to connect</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E293B]">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-xs text-[#64748B]">Rafael</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E293B]">
              <div className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="text-xs text-[#64748B]">Aiona</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E293B]">
              <div className="w-2 h-2 rounded-full bg-[#14B8A6]" />
              <span className="text-xs text-[#64748B]">Gabriel</span>
            </div>
          </div>
        </div>
        {/* Canvas */}
        <div className="flex-1 h-[calc(100vh-8rem)]">
          <ForgeCanvas />
        </div>
      </motion.div>
    </div>
  );
}
