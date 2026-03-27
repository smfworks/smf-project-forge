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
    // Initialize tables on first connect (best-effort — table may already exist)
    try {
      await _db.execute(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'other', phase INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS nodes (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, phase INTEGER NOT NULL DEFAULT 0, type TEXT NOT NULL DEFAULT 'idea', title TEXT, content TEXT, team TEXT, source TEXT, parent_id TEXT, position_x REAL DEFAULT 0, position_y REAL DEFAULT 0, created_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS artifacts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, phase INTEGER NOT NULL DEFAULT 0, type TEXT NOT NULL, title TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, content TEXT, gdoc_url TEXT, local_path TEXT, agent_id TEXT, status TEXT NOT NULL DEFAULT 'draft', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS agent_status (id TEXT PRIMARY KEY, name TEXT NOT NULL, team TEXT NOT NULL, model TEXT, current_task TEXT, status TEXT NOT NULL DEFAULT 'idle', updated_at INTEGER NOT NULL)`);
      await _db.execute(`CREATE TABLE IF NOT EXISTS queue_entries (id TEXT PRIMARY KEY, queue TEXT NOT NULL, machine TEXT NOT NULL, action TEXT NOT NULL, entry TEXT NOT NULL, created_at INTEGER NOT NULL)`);
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
