/**
 * server.ts — Express Application Factory
 *
 * Assembles the read-only Phyto.ai API and binds it to an explicit,
 * loader-produced runtime configuration. The factory revalidates the boundary
 * before registering routes, so alternate entry points cannot serve seed data
 * under forged staging or production settings.
 */

import express, { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler";
import analyticsRouter from "./routes/analytics";
import healthRouter from "./routes/health";
import protocolsRouter from "./routes/protocols";
import {
  RuntimeConfig,
  assertValidatedRuntimeConfig,
  loadRuntimeConfig,
} from "./runtime";
import { ApiErrorResponse } from "./types";

export function createApp(
  runtimeConfig: Readonly<RuntimeConfig> = loadRuntimeConfig()
): express.Application {
  assertValidatedRuntimeConfig(runtimeConfig);

  const app = express();
  app.locals.runtimeConfig = runtimeConfig;

  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/protocols", protocolsRouter);
  app.use("/analytics", analyticsRouter);

  app.use((_req: Request, res: Response) => {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
      generatedAt: new Date().toISOString(),
    };
    res.status(404).json(body);
  });

  app.use(errorHandler);

  return app;
}
