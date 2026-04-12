/**
 * server.ts — Express Application Factory
 *
 * Assembles and exports the Express application used by the Phyto.ai external
 * API layer (Phase 3). The app is intentionally exported as a factory so that
 * integration tests can obtain a fresh instance without binding to a port.
 *
 * Architecture constraints enforced here:
 *   - Read-only: only GET routes are registered (LOCK-002).
 *   - No moat-protected internals are exposed (LOCK-002, M-002, M-003, M-004).
 *   - All controllers delegate to existing domain and analytics modules only.
 *   - Error handling is centralised via errorHandler middleware.
 *
 * Routes:
 *   GET /health
 *   GET /protocols
 *   GET /protocols/:id
 *   GET /analytics/protocols
 *   GET /analytics/protocols/:id
 */

import express, { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler";
import analyticsRouter from "./routes/analytics";
import healthRouter from "./routes/health";
import protocolsRouter from "./routes/protocols";
import { ApiErrorResponse } from "./types";

/**
 * Creates and configures the Express application.
 *
 * @returns A configured Express application instance (not yet listening).
 */
export function createApp(): express.Application {
  const app = express();

  // Parse JSON request bodies.
  app.use(express.json());

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------

  app.use("/health", healthRouter);
  app.use("/protocols", protocolsRouter);
  app.use("/analytics", analyticsRouter);

  // ---------------------------------------------------------------------------
  // 404 handler — must come after all routes
  // ---------------------------------------------------------------------------

  app.use((_req: Request, res: Response) => {
    const body: ApiErrorResponse = {
      success: false,
      error: { code: "NOT_FOUND", message: "The requested resource was not found." },
      generatedAt: new Date().toISOString(),
    };
    res.status(404).json(body);
  });

  // ---------------------------------------------------------------------------
  // Global error handler — must be the last middleware registered
  // ---------------------------------------------------------------------------

  app.use(errorHandler);

  return app;
}
