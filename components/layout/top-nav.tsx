"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Flame,
  LayoutGrid,
  GitBranch,
  Users,
  Archive,
  Settings,
  Zap
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutGrid, label: "Pipeline" },
  { href: "/canvas", icon: GitBranch, label: "Canvas" },
  { href: "/roster", icon: Users, label: "Agents" },
  { href: "/artifacts", icon: Archive, label: "Vault" },
  { href: "/forge-settings", icon: Settings, label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-[#1E293B] glass">
      <div className="flex h-full items-center justify-between px-4 max-w-[1600px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center transition-transform group-hover:scale-105">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">
            Project <span className="text-[#3B82F6]">Forge</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#1E293B] text-[#E2E8F0]"
                    : "text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B]/50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E293B]/50 text-sm">
            <Flame className="w-4 h-4 text-[#F97316]" />
            <span className="text-[#64748B]">28 agents</span>
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}
