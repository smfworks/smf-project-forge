// Schema types for SMF Project Forge

export interface Project {
  id: string;
  name: string;
  type: "blog" | "ops" | "series" | "other";
  description: string | null;
  phase: number;
  status: "active" | "completed" | "archived";
  createdAt: number;
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

export interface AgentLiveStatus {
  id: string;
  name: string;
  team: string;
  gateway: string;
  status: "active" | "idle" | "blocked";
  model: string;
  currentTask?: string;
  lastSeen?: number;
}
