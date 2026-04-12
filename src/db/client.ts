/**
 * client.ts — Prisma Client Singleton
 *
 * Exports a shared PrismaClient instance for use by all repository
 * implementations. A single instance is reused across the application
 * lifetime to avoid connection pool exhaustion.
 *
 * The instance is initialised lazily on first import so that test modules
 * that mock the generated client are not affected by premature construction.
 */

import { PrismaClient } from "../generated/prisma";

// Singleton instance — not exported directly so callers cannot replace it.
let _client: PrismaClient | undefined;

/**
 * Returns the shared PrismaClient singleton, creating it on first call.
 * All repository implementations must obtain the client through this function.
 */
export function getPrismaClient(): PrismaClient {
  if (!_client) {
    _client = new PrismaClient();
  }
  return _client;
}
