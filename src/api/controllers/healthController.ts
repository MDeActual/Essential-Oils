/**
 * healthController.ts — Liveness and readiness probes
 *
 * GET /health reports process liveness and non-secret runtime metadata.
 * GET /health/ready verifies that the configured storage backend is usable.
 */

import { Request, Response } from "express";
import { getPrismaClient } from "../../db/client";
import type { RuntimeConfig } from "../runtime";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  HealthPayload,
  ReadinessPayload,
} from "../types";

const SERVER_START = Date.now();

function runtimeConfig(res: Response): Readonly<RuntimeConfig> {
  return res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
}

export function getHealth(_req: Request, res: Response): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { version } = require("../../../package.json") as { version: string };
  const config = runtimeConfig(res);

  const payload: HealthPayload = {
    status: "ok",
    version,
    uptime: Math.floor((Date.now() - SERVER_START) / 1000),
    runtimeMode: config.runtimeMode,
    storageMode: config.storageMode,
  };

  const body: ApiSuccessResponse<HealthPayload> = {
    success: true,
    data: payload,
    generatedAt: new Date().toISOString(),
  };

  res.status(200).json(body);
}

export async function getReadiness(_req: Request, res: Response): Promise<void> {
  const config = runtimeConfig(res);

  if (config.storageMode === "memory") {
    const payload: ReadinessPayload = {
      status: "ready",
      runtimeMode: config.runtimeMode,
      storageMode: config.storageMode,
      database: "not_required",
    };
    res.status(200).json({
      success: true,
      data: payload,
      generatedAt: new Date().toISOString(),
    } satisfies ApiSuccessResponse<ReadinessPayload>);
    return;
  }

  try {
    await getPrismaClient().$queryRaw`SELECT 1`;
    const payload: ReadinessPayload = {
      status: "ready",
      runtimeMode: config.runtimeMode,
      storageMode: config.storageMode,
      database: "connected",
    };
    res.status(200).json({
      success: true,
      data: payload,
      generatedAt: new Date().toISOString(),
    } satisfies ApiSuccessResponse<ReadinessPayload>);
  } catch {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: "NOT_READY",
        message: "The configured storage backend is not ready.",
      },
      generatedAt: new Date().toISOString(),
    };
    res.status(503).json(body);
  }
}
