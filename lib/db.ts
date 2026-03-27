import { createClient } from "@libsql/client";

// Lazy-initialize: only connect when actually called at runtime
// This allows `next build` to succeed without env vars
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
  }
  return _db;
}

// Re-export db as a getter so it's lazily initialized
// Use db.exec() / db.prepare() directly via getDb()
export { getDb };

// Convenience: if you import { db } directly, it will throw if not configured
// Prefer importing { getDb } in API routes
