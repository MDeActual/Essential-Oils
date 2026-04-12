/**
 * healthController.ts — Health Endpoint Controller
 *
 * Handles GET /health. Returns a lightweight liveness signal with server
 * version and uptime. No domain or analytics modules are invoked — this
 * endpoint must remain dependency-free to serve as a reliable health probe.
 */

import { Request, Response } from "express";
import { ApiSuccessResponse, HealthPayload } from "../types";

/** Server start time used to compute uptime. */
const SERVER_START = Date.now();

/**
 * GET /health
 *
 * Returns 200 with server status, package version, and uptime in seconds.
 */
export function getHealth(_req: Request, res: Response): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { version } = require("../../../package.json") as { version: string };

  const payload: HealthPayload = {
    status: "ok",
    version,
    uptime: Math.floor((Date.now() - SERVER_START) / 1000),
  };

  const body: ApiSuccessResponse<HealthPayload> = {
    success: true,
    data: payload,
    generatedAt: new Date().toISOString(),
  };

  res.status(200).json(body);
}
