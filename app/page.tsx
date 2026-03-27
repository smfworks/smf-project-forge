"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TopNav } from "@/components/layout/top-nav";
import { PhaseGateDashboard } from "@/components/phases/phase-gate-dashboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_PROJECT = {
  id: "demo",
  name: "AI Orchestration Series",
  type: "blog" as const,
  phase: 2,
  status: "active" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function HomePage() {
  const [project, setProject] = useState(DEMO_PROJECT);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectType, setNewProjectType] = useState<string>("blog");  const [currentPhase, setCurrentPhase] = useState(2);

  const handlePhaseAdvance = (phase: number) => {
    if (phase < 5) {
      setCurrentPhase(phase + 1);
    }
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    setProject({
      id: "new",
      name: newProjectName,
      type: newProjectType as typeof project.type,
      phase: 0,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCurrentPhase(0);
    setShowNewProject(false);
    setNewProjectName("");
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <TopNav />

      <main className="p-6 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PhaseGateDashboard
            currentPhase={currentPhase}
            projectName={project.name}
            onPhaseAdvance={handlePhaseAdvance}
          />

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center gap-3"
          >
            <Button
              onClick={() => setShowNewProject(true)}
              className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-[#1E293B] bg-[#111827] hover:bg-[#1E293B] text-[#94A3B8]"
            >
              <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
              Harvest Ideas
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* New Project Dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="bg-[#111827] border-[#1E293B] text-[#E2E8F0] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Create New Project</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              Start a new six-phase creative production pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-[#94A3B8]">Project Name</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Spring Blog Series"
                className="bg-[#0A0F1E] border-[#1E293B] focus:border-[#3B82F6] text-[#E2E8F0]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-[#94A3B8]">Project Type</Label>
              <Select value={newProjectType} onValueChange={(v) => setNewProjectType(v || "blog")}>
                <SelectTrigger className="bg-[#0A0F1E] border-[#1E293B] text-[#E2E8F0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-[#1E293B] text-[#E2E8F0]">
                  <SelectItem value="blog">Blog Series</SelectItem>
                  <SelectItem value="ops">Ops Mission</SelectItem>
                  <SelectItem value="series">Great Thinkers Episode</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateProject}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white mt-2"
            >
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
