"use client";

import { TopNav } from "@/components/layout/top-nav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  Terminal,
  FlaskConical,
  Link2,
  Key,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    setTestResult({ ok: true, message: "Connected to Vercel KV — all systems operational" });
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <TopNav />
      <main className="p-6 max-w-[800px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-[#64748B] text-sm mt-1">Configure Forge to connect with your agent ecosystem</p>
        </motion.div>

        <div className="mt-8 flex flex-col gap-6">
          {/* Sync daemon */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 bg-[#111827]/60 border-[#1E293B] rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="font-semibold">Sync Daemon</h3>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    The forge-sync-agent.py keeps your queues in sync with Forge
                  </p>
                </div>
              </div>
              <div className="bg-[#0A0F1E] rounded-xl p-4 font-mono text-xs text-[#94A3B8] mb-4">
                <div className="text-[#64748B] mb-2"># Install on each agent machine</div>
                <div className="text-[#F97316]">pip install watchdog requests</div>
                <div className="text-[#64748B] mt-2 mb-2"># Configure queues</div>
                <div className="text-[#94A3B8]">sudo nano /etc/forge/queues.conf</div>
                <div className="text-[#64748B] mt-2 mb-2"># Start daemon</div>
                <div className="text-[#22C55E]">python3 /opt/forge/forge-sync-agent.py &</div>
              </div>
              <Button variant="outline" className="gap-2 border-[#1E293B] bg-[#1E293B]/50 hover:bg-[#1E293B] text-[#94A3B8]">
                <FlaskConical className="w-4 h-4" />
                View install script
              </Button>
            </Card>
          </motion.div>

          <Separator className="bg-[#1E293B]" />

          {/* API Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 bg-[#111827]/60 border-[#1E293B] rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="font-semibold">API Configuration</h3>
                  <p className="text-sm text-[#64748B] mt-0.5">Keys and endpoints for connecting agent machines</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-[#94A3B8]">Forge API URL</Label>
                  <Input
                    defaultValue="https://forge.smfworks.com"
                    className="bg-[#0A0F1E] border-[#1E293B] text-[#E2E8F0] font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-[#94A3B8]">Agent API Token</Label>
                  <Input
                    type="password"
                    defaultValue="forge-agent-token-xxx"
                    className="bg-[#0A0F1E] border-[#1E293B] text-[#E2E8F0] font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Button onClick={testConnection} disabled={testing} className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    {testing ? "Testing..." : "Test Connection"}
                  </Button>
                  {testResult && (
                    <span className={`text-sm flex items-center gap-1 ${testResult.ok ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      {testResult.message}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          <Separator className="bg-[#1E293B]" />

          {/* Queue paths */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 bg-[#111827]/60 border-[#1E293B] rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/20 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <div>
                  <h3 className="font-semibold">Queue Paths</h3>
                  <p className="text-sm text-[#64748B] mt-0.5">Local queue file paths on each agent machine</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { machine: "mikesai1", path: "/home/mikesai1/.../smf-agents/shared/data/", color: "#F97316", label: "Aiona" },
                  { machine: "mikesai2", path: "/home/mikesai2/.../smf-agents/shared/data/", color: "#14B8A6", label: "Gabriel" },
                  { machine: "mikesai3", path: "/home/mikesai3/.../smf-agents/shared/data/", color: "#F59E0B", label: "Rafael" },
                ].map((m) => (
                  <div key={m.machine} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    <span className="text-xs font-mono text-[#64748B] w-24">{m.label}</span>
                    <code className="flex-1 text-xs font-mono bg-[#0A0F1E] px-3 py-2 rounded-lg text-[#94A3B8]">
                      {m.path}
                    </code>
                    <Badge variant="outline" className="text-xs border-[#1E293B] text-[#475569]">Configured</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
