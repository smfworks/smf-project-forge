import { createClient } from "@libsql/client";
import type { Project, Node, Artifact, AgentStatus, QueueEntry } from "./types";

// Singleton DB — lazily initialized
let _db: ReturnType<typeof createClient> | null = null;

function getDb() {
  if (!_db) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error(
        "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set. " +
        "Add them in Vercel project settings or .env.local"
      );
    }
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    // Initialize tables on first connect
    _db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'other',
        description TEXT,
        phase INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        phase INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL DEFAULT 'idea',
        title TEXT,
        content TEXT,
        team TEXT,
        source TEXT,
        parent_id TEXT,
        position_x REAL DEFAULT 0,
        position_y REAL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        phase INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        content TEXT,
        gdoc_url TEXT,
        local_path TEXT,
        agent_id TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS agent_status (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        team TEXT NOT NULL,
        model TEXT,
        current_task TEXT,
        status TEXT NOT NULL DEFAULT 'idle',
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS queue_entries (
        id TEXT PRIMARY KEY,
        queue TEXT NOT NULL,
        machine TEXT NOT NULL,
        action TEXT NOT NULL,
        entry TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }
  return _db;
}

// ── Projects ──────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const db = getDb();
  const rows = db.execute("SELECT * FROM projects ORDER BY updated_at DESC");
  return (rows.rows || []).map(mapProject);
}

export async function createProject(data: {
  name: string;
  type: string;
  description?: string;
}): Promise<Project> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  db.execute({
    sql: `INSERT INTO projects (id, name, type, description, phase, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 0, 'active', ?, ?)`,
    args: [id, data.name, data.type, data.description ?? null, now, now],
  });
  return { id, name: data.name, type: data.type as Project["type"], description: data.description ?? null, phase: 0, status: "active", createdAt: now, updatedAt: now };
}

export async function getProject(id: string): Promise<Project | null> {
  const db = getDb();
  const rows = db.execute({ sql: "SELECT * FROM projects WHERE id = ?", args: [id] });
  return rows.rows?.[0] ? mapProject(rows.rows[0]) : null;
}

export async function updateProject(id: string, data: Partial<Pick<Project, "name" | "phase" | "status">>): Promise<Project | null> {
  const db = getDb();
  const now = Date.now();
  const fields: string[] = ["updated_at = ?"];
  const args: (string | number)[] = [now];
  if (data.name !== undefined) { fields.push("name = ?"); args.push(data.name); }
  if (data.phase !== undefined) { fields.push("phase = ?"); args.push(data.phase); }
  if (data.status !== undefined) { fields.push("status = ?"); args.push(data.status); }
  args.push(id);
  db.execute({ sql: `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`, args });
  return getProject(id);
}

// ── Nodes ──────────────────────────────────────────────────

export async function listNodes(projectId: string): Promise<Node[]> {
  const db = getDb();
  const rows = db.execute({ sql: "SELECT * FROM nodes WHERE project_id = ?", args: [projectId] });
  return (rows.rows || []).map(mapNode);
}

export async function createNode(data: {
  projectId: string;
  phase?: number;
  type?: string;
  title?: string;
  content?: string;
  team?: string;
  source?: string;
  parentId?: string;
  positionX?: number;
  positionY?: number;
}): Promise<Node> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  db.execute({
    sql: `INSERT INTO nodes (id, project_id, phase, type, title, content, team, source, parent_id, position_x, position_y, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.projectId, data.phase ?? 0, data.type ?? "idea", data.title ?? null, data.content ?? null, data.team ?? null, data.source ?? null, data.parentId ?? null, data.positionX ?? 0, data.positionY ?? 0, now],
  });
  return { id, projectId: data.projectId, phase: data.phase ?? 0, type: (data.type ?? "idea") as Node["type"], title: data.title ?? null, content: data.content ?? null, team: data.team ?? null, source: data.source ?? null, parentId: data.parentId ?? null, positionX: data.positionX ?? 0, positionY: data.positionY ?? 0, createdAt: now };
}

// ── Artifacts ─────────────────────────────────────────────

export async function listArtifacts(projectId?: string): Promise<Artifact[]> {
  const db = getDb();
  const sql = projectId ? "SELECT * FROM artifacts WHERE project_id = ?" : "SELECT * FROM artifacts";
  const rows = db.execute({ sql, args: projectId ? [projectId] : [] });
  return (rows.rows || []).map(mapArtifact);
}

export async function createArtifact(data: {
  projectId: string;
  phase?: number;
  type: string;
  title: string;
  content?: string;
  gdocUrl?: string;
  localPath?: string;
  agentId?: string;
}): Promise<Artifact> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  db.execute({
    sql: `INSERT INTO artifacts (id, project_id, phase, type, title, version, content, gdoc_url, local_path, agent_id, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 'draft', ?, ?)`,
    args: [id, data.projectId, data.phase ?? 0, data.type, data.title, data.content ?? null, data.gdocUrl ?? null, data.localPath ?? null, data.agentId ?? null, now, now],
  });
  return { id, projectId: data.projectId, phase: data.phase ?? 0, type: data.type, title: data.title, version: 1, content: data.content ?? null, gdocUrl: data.gdocUrl ?? null, localPath: data.localPath ?? null, agentId: data.agentId ?? null, status: "draft", createdAt: now, updatedAt: now };
}

// ── Helpers ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProject(r: any): Project {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as Project["type"],
    description: r.description as string | null,
    phase: r.phase as number,
    status: r.status as Project["status"],
    createdAt: r.created_at as number,
    updatedAt: r.updated_at as number,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNode(r: any): Node {
  return {
    id: r.id as string,
    projectId: r.project_id as string,
    phase: r.phase as number,
    type: r.type as Node["type"],
    title: r.title as string | null,
    content: r.content as string | null,
    team: r.team as string | null,
    source: r.source as string | null,
    parentId: r.parent_id as string | null,
    positionX: r.position_x as number,
    positionY: r.position_y as number,
    createdAt: r.created_at as number,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArtifact(r: any): Artifact {
  return {
    id: r.id as string,
    projectId: r.project_id as string,
    phase: r.phase as number,
    type: r.type as string,
    title: r.title as string,
    version: r.version as number,
    content: r.content as string | null,
    gdocUrl: r.gdoc_url as string | null,
    localPath: r.local_path as string | null,
    agentId: r.agent_id as string | null,
    status: r.status as Artifact["status"],
    createdAt: r.created_at as number,
    updatedAt: r.updated_at as number,
  };
}
