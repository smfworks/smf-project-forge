import { createClient, type Client, type ResultSet } from "@libsql/client";

// Singleton DB — lazily initialized at runtime
let _db: Client | null = null;

async function initDb(): Promise<Client> {
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
    // Initialize all tables (best-effort — each may already exist)
    try {
      await _db.execute(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'other', phase INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS nodes (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, phase INTEGER NOT NULL DEFAULT 0, type TEXT NOT NULL DEFAULT 'idea', title TEXT, content TEXT, team TEXT, source TEXT, parent_id TEXT, position_x REAL DEFAULT 0, position_y REAL DEFAULT 0, created_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS artifacts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, phase INTEGER NOT NULL DEFAULT 0, type TEXT NOT NULL, title TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, content TEXT, gdoc_url TEXT, local_path TEXT, agent_id TEXT, status TEXT NOT NULL DEFAULT 'draft', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS agent_status (id TEXT PRIMARY KEY, name TEXT NOT NULL, team TEXT NOT NULL, model TEXT, current_task TEXT, status TEXT NOT NULL DEFAULT 'idle', updated_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS queue_entries (id TEXT PRIMARY KEY, queue TEXT NOT NULL, machine TEXT NOT NULL, action TEXT NOT NULL, entry TEXT NOT NULL, created_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS agent_status_cache (gateway TEXT NOT NULL, session_key TEXT NOT NULL, session_id TEXT NOT NULL, agent_id TEXT NOT NULL, model TEXT, kind TEXT NOT NULL DEFAULT 'direct', status TEXT NOT NULL DEFAULT 'idle', updated_at INTEGER NOT NULL, last_seen INTEGER NOT NULL, PRIMARY KEY (gateway, session_key))`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS canvas_nodes (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, node_type TEXT NOT NULL DEFAULT 'idea', label TEXT NOT NULL, team TEXT, source TEXT, position_x REAL NOT NULL DEFAULT 0, position_y REAL NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS canvas_edges (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, source TEXT NOT NULL, target TEXT NOT NULL, edge_type TEXT NOT NULL DEFAULT 'default', created_at INTEGER NOT NULL)`);
    } catch (_e) {
      // Tables may already exist — continue
    }
  }
  return _db;
}

// Re-export ResultSet for convenience
export type { ResultSet };

// ── Project helpers ────────────────────────────────────────

export async function listProjects() {
  const db = await initDb();
  const result: ResultSet = await db.execute("SELECT * FROM projects ORDER BY updated_at DESC");
  return (result.rows || []).map((r) => ({
    id: r.id as string, name: r.name as string, type: r.type as string,
    phase: r.phase as number, status: r.status as string,
    createdAt: r.created_at as number, updatedAt: r.updated_at as number,
  }));
}

export async function createProject(data: { name: string; type?: string }) {
  const db = await initDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.execute({
    sql: "INSERT INTO projects (id, name, type, phase, status, created_at, updated_at) VALUES (?, ?, ?, 0, 'active', ?, ?)",
    args: [id, data.name, data.type || "other", now, now],
  });
  return { id, name: data.name, type: data.type || "other", phase: 0, status: "active", createdAt: now, updatedAt: now };
}

export async function getProject(id: string) {
  const db = await initDb();
  const result: ResultSet = await db.execute({ sql: "SELECT * FROM projects WHERE id = ?", args: [id] });
  const r = (result.rows || [])[0];
  if (!r) return null;
  return { id: r.id as string, name: r.name as string, type: r.type as string, phase: r.phase as number, status: r.status as string, createdAt: r.created_at as number, updatedAt: r.updated_at as number };
}

export async function updateProject(id: string, data: { name?: string; phase?: number; status?: string }) {
  const db = await initDb();
  const now = Date.now();
  const fields: string[] = ["updated_at = ?"];
  const args: (string | number)[] = [now];
  if (data.name !== undefined) { fields.push("name = ?"); args.push(data.name); }
  if (data.phase !== undefined) { fields.push("phase = ?"); args.push(data.phase); }
  if (data.status !== undefined) { fields.push("status = ?"); args.push(data.status); }
  args.push(id);
  await db.execute({ sql: `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`, args });
  return getProject(id);
}

export async function deleteProject(id: string) {
  const db = await initDb();
  await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [id] });
}

// ── Node helpers ────────────────────────────────────────────

export async function listNodes(projectId: string) {
  const db = await initDb();
  const result: ResultSet = await db.execute({ sql: "SELECT * FROM nodes WHERE project_id = ?", args: [projectId] });
  return (result.rows || []).map((r) => ({
    id: r.id as string, projectId: r.project_id as string, phase: r.phase as number,
    type: r.type as string, title: r.title as string | null, content: r.content as string | null,
    team: r.team as string | null, source: r.source as string | null,
    parentId: r.parent_id as string | null, positionX: r.position_x as number, positionY: r.position_y as number,
    createdAt: r.created_at as number,
  }));
}

export async function createNode(data: {
  projectId: string; phase?: number; type?: string; title?: string;
  content?: string; team?: string; source?: string; parentId?: string;
  positionX?: number; positionY?: number;
}) {
  const db = await initDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.execute({
    sql: "INSERT INTO nodes (id, project_id, phase, type, title, content, team, source, parent_id, position_x, position_y, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [id, data.projectId, data.phase ?? 0, data.type ?? "idea", data.title ?? null, data.content ?? null, data.team ?? null, data.source ?? null, data.parentId ?? null, data.positionX ?? 0, data.positionY ?? 0, now],
  });
  return { id, ...data, phase: data.phase ?? 0, type: data.type ?? "idea", createdAt: now };
}

// ── Artifact helpers ───────────────────────────────────────

export async function listArtifacts(projectId?: string) {
  const db = await initDb();
  const result: ResultSet = projectId
    ? await db.execute({ sql: "SELECT * FROM artifacts WHERE project_id = ?", args: [projectId] })
    : await db.execute("SELECT * FROM artifacts");
  return (result.rows || []).map((r) => ({
    id: r.id as string, projectId: r.project_id as string, phase: r.phase as number,
    type: r.type as string, title: r.title as string, version: r.version as number,
    content: r.content as string | null, gdocUrl: r.gdoc_url as string | null,
    localPath: r.local_path as string | null, agentId: r.agent_id as string | null,
    status: r.status as string, createdAt: r.created_at as number, updatedAt: r.updated_at as number,
  }));
}

export async function createArtifact(data: {
  projectId: string; phase?: number; type: string; title: string;
  content?: string; gdocUrl?: string; localPath?: string; agentId?: string;
}) {
  const db = await initDb();
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.execute({
    sql: "INSERT INTO artifacts (id, project_id, phase, type, title, version, content, gdoc_url, local_path, agent_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 'draft', ?, ?)",
    args: [id, data.projectId, data.phase ?? 0, data.type, data.title, data.content ?? null, data.gdocUrl ?? null, data.localPath ?? null, data.agentId ?? null, now, now],
  });
  return { id, ...data, phase: data.phase ?? 0, version: 1, status: "draft" as const, createdAt: now, updatedAt: now };
}

// ── Agent status cache helpers ─────────────────────────────

export async function upsertAgentStatusCache(entries: Array<{
  gateway: string;
  sessionKey: string;
  sessionId: string;
  agentId: string;
  model: string;
  kind: string;
  status: "active" | "idle" | "blocked";
  updatedAt: number;
}>) {
  const db = await initDb();
  const now = Date.now();
  for (const e of entries) {
    await db.execute({
      sql: `INSERT INTO agent_status_cache (gateway, session_key, session_id, agent_id, model, kind, status, updated_at, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(gateway, session_key) DO UPDATE SET
              session_id = excluded.session_id, agent_id = excluded.agent_id,
              model = excluded.model, kind = excluded.kind, status = excluded.status,
              updated_at = excluded.updated_at, last_seen = excluded.last_seen`,
      args: [e.gateway, e.sessionKey, e.sessionId, e.agentId, e.model, e.kind, e.status, e.updatedAt, now],
    });
  }
}

export async function getAgentStatusCache() {
  const db = await initDb();
  const result: ResultSet = await db.execute(
    "SELECT gateway, session_key, session_id, agent_id, model, kind, status, updated_at, last_seen FROM agent_status_cache"
  );
  return (result.rows || []).map((r) => ({
    gateway: r.gateway as string,
    sessionKey: r.session_key as string,
    sessionId: r.session_id as string,
    agentId: r.agent_id as string,
    model: r.model as string,
    kind: r.kind as string,
    status: r.status as "active" | "idle" | "blocked",
    updatedAt: (r.updated_at as number) || 0,
    lastSeen: (r.last_seen as number) || 0,
  }));
}

// ── Canvas node helpers ─────────────────────────────────────

export async function listCanvasNodes(projectId: string) {
  const db = await initDb();
  const result: ResultSet = await db.execute({
    sql: "SELECT * FROM canvas_nodes WHERE project_id = ? ORDER BY created_at ASC",
    args: [projectId],
  });
  return (result.rows || []).map((r) => ({
    id: r.id as string,
    projectId: r.project_id as string,
    nodeType: r.node_type as string,
    label: r.label as string,
    team: r.team as string | null,
    source: r.source as string | null,
    positionX: r.position_x as number,
    positionY: r.position_y as number,
    createdAt: r.created_at as number,
  }));
}

export async function upsertCanvasNode(data: {
  id: string;
  projectId: string;
  nodeType: string;
  label: string;
  team?: string;
  source?: string;
  positionX: number;
  positionY: number;
}) {
  const db = await initDb();
  const now = Date.now();
  await db.execute({
    sql: `INSERT INTO canvas_nodes (id, project_id, node_type, label, team, source, position_x, position_y, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            label = excluded.label, team = excluded.team, source = excluded.source,
            position_x = excluded.position_x, position_y = excluded.position_y`,
    args: [data.id, data.projectId, data.nodeType, data.label, data.team ?? null, data.source ?? null, data.positionX, data.positionY, now],
  });
}

export async function deleteCanvasNode(id: string) {
  const db = await initDb();
  await db.execute({ sql: "DELETE FROM canvas_nodes WHERE id = ?", args: [id] });
}

export async function listCanvasEdges(projectId: string) {
  const db = await initDb();
  const result: ResultSet = await db.execute({
    sql: "SELECT * FROM canvas_edges WHERE project_id = ?",
    args: [projectId],
  });
  return (result.rows || []).map((r) => ({
    id: r.id as string,
    projectId: r.project_id as string,
    source: r.source as string,
    target: r.target as string,
    edgeType: r.edge_type as string,
  }));
}

export async function upsertCanvasEdge(data: {
  id: string;
  projectId: string;
  source: string;
  target: string;
  edgeType?: string;
}) {
  const db = await initDb();
  const now = Date.now();
  await db.execute({
    sql: `INSERT INTO canvas_edges (id, project_id, source, target, edge_type, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET source = excluded.source, target = excluded.target, edge_type = excluded.edge_type`,
    args: [data.id, data.projectId, data.source, data.target, data.edgeType ?? "default", now],
  });
}

export async function deleteCanvasEdge(id: string) {
  const db = await initDb();
  await db.execute({ sql: "DELETE FROM canvas_edges WHERE id = ?", args: [id] });
}

export async function deleteCanvasNodesForProject(projectId: string) {
  const db = await initDb();
  await db.execute({ sql: "DELETE FROM canvas_nodes WHERE project_id = ?", args: [projectId] });
}

export async function deleteCanvasEdgesForProject(projectId: string) {
  const db = await initDb();
  await db.execute({ sql: "DELETE FROM canvas_edges WHERE project_id = ?", args: [projectId] });
}

// Export the db instance for direct use
export { initDb as db };
