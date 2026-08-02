/**
 * client.ts — Prisma Client Singleton
 *
 * Exports a shared PrismaClient instance for use by all repository
 * implementations. A single instance is reused across the application
 * lifetime to avoid connection pool exhaustion.
 *
 * Prisma 7 requires an explicit driver adapter for direct database access.
 * The adapter and client are initialised lazily so no-database tests and the
 * in-memory API path do not attempt to create a database connection.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

// Singleton instance — not exported directly so callers cannot replace it.
let _client: PrismaClient | undefined;

/**
 * Returns the shared PrismaClient singleton, creating it on first call.
 * All repository implementations must obtain the client through this function.
 */
export function getPrismaClient(): PrismaClient {
  if (!_client) {
    const connectionString = process.env["DATABASE_URL"];
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for database-backed operation.");
    }

    const adapter = new PrismaPg({ connectionString });
    _client = new PrismaClient({ adapter });
  }
  return _client;
}
