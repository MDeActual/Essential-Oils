/**
 * server.ts — Express Application Factory
 *
 * Assembles the read-only Phyto.ai API and binds it to an explicit runtime
 * configuration. The factory fails closed before route registration when a
 * staging or production process lacks database-backed storage.
 */

import express, { Request, Response } from "express";
import { RuntimeConfig, loadRuntimeConfig } from "../config/runtime";
import { errorHandler } from "./middleware/errorHandler";
import analyticsRouter from "./routes/analytics";
import healthRouter from "./routes/health";
import protocolsRouter from "./routes/protocols";
import { ApiErrorResponse } from "./types";

/**
 * Creates and configures the Express application.
 *
 * The optional argument supports deterministic tests. Production entry points
 * must pass the result of loadRuntimeConfig(process.env), not a hand-built
 * configuration object.
 */
export function createApp(
  runtimeConfig: Readonly<RuntimeConfig> = loadRuntimeConfig()
): express.Application {
  const app = express();
  app.locals.runtimeConfig = runtimeConfig;

  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/protocols", protocolsRouter);
  app.use("/analytics", analyticsRouter);

  app.use((_req: Request, res: Response) => {
    const body: ApiErrorResponse = {
      success: false,
      error: { code: "NOT_FOUND", message: "The requested resource was not found." },
      generatedAt: new Date().toISOString(),
    };
    res.status(404).json(body);
  });

  app.use(errorHandler);

  return app;
}
