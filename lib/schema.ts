import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'blog' | 'ops' | 'series' | 'other'
  description: text("description"),
  phase: integer("phase").notNull().default(0), // 0=Brainstorm ... 5=Final
  status: text("status").notNull().default("active"), // 'active' | 'completed' | 'archived'
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: integer("phase").notNull(), // 0-5
  type: text("type").notNull(), // 'idea' | 'bubble' | 'artifact'
  title: text("title"),
  content: text("content"),
  team: text("team"), // 'rafael' | 'aiona' | 'gabriel'
  source: text("source"), // 'radar' | 'hunter' | 'historian' | etc.
  parentId: text("parent_id"), // for bubble grouping
  positionX: real("position_x").default(0),
  positionY: real("position_y").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const artifacts = sqliteTable("artifacts", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: integer("phase").notNull(),
  type: text("type").notNull(), // 'requirements' | 'adr' | 'blog_draft' | 'code' | 'audio' | 'video' | 'series_episode'
  title: text("title").notNull(),
  version: integer("version").notNull().default(1),
  content: text("content"),
  gdocUrl: text("gdoc_url"),
  localPath: text("local_path"),
  agentId: text("agent_id"),
  status: text("status").notNull().default("draft"), // 'draft' | 'edited' | 'published'
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const agentStatus = sqliteTable("agent_status", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  team: text("team").notNull(), // 'rafael' | 'aiona' | 'gabriel'
  model: text("model"),
  currentTask: text("current_task"),
  status: text("status").notNull().default("idle"), // 'active' | 'idle' | 'blocked'
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const queueEntries = sqliteTable("queue_entries", {
  id: text("id").primaryKey(),
  queue: text("queue").notNull(), // 'opportunities' | 'proposals' | 'missions' | 'completed'
  machine: text("machine").notNull(), // 'mikesai1' | 'mikesai2' | 'mikesai3'
  action: text("action").notNull(), // 'add' | 'update' | 'complete'
  entry: text("entry").notNull(), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
