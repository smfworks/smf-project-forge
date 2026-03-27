// Schema types for SMF Project Forge
// These map to the Turso SQLite tables.

export interface Project {
  id: string;
  name: string;
  type: "blog" | "ops" | "series" | "other";
  description: string | null;
  phase: number;
  status: "active" | "completed" | "archived";
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number;
}

export interface Node {
  id: string;
  projectId: string;
  phase: number;
  type: "idea" | "bubble" | "artifact";
  title: string | null;
  content: string | null;
  team: string | null;
  source: string | null;
  parentId: string | null;
  positionX: number;
  positionY: number;
  createdAt: number;
}

export interface Artifact {
  id: string;
  projectId: string;
  phase: number;
  type: string;
  title: string;
  version: number;
  content: string | null;
  gdocUrl: string | null;
  localPath: string | null;
  agentId: string | null;
  status: "draft" | "edited" | "published";
  createdAt: number;
  updatedAt: number;
}

export interface AgentStatus {
  id: string;
  name: string;
  team: "rafael" | "aiona" | "gabriel";
  model: string | null;
  currentTask: string | null;
  status: "active" | "idle" | "blocked";
  updatedAt: number;
}

export interface QueueEntry {
  id: string;
  queue: string;
  machine: string;
  action: string;
  entry: string; // JSON string
  createdAt: number;
}
