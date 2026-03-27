import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SMF Project Forge — The AI Manuscript Orchestrator",
  description: "A calm, writer-focused web application for orchestrating the SMF agent ecosystem through a six-phase creative production pipeline.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0F1E] text-[#E2E8F0] antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
