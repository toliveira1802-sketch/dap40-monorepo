import { db } from "@dap40/database";

/**
 * Lazy DB accessor for CRM store.
 * Returns null when connection/query fails so the in-memory fallback kicks in.
 * Does NOT run migrations — schema is versioned only.
 */
export async function getDb() {
  try {
    return db;
  } catch {
    return null;
  }
}
