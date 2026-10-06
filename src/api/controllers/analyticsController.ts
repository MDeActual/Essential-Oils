import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../middleware/errorHandler";
import type { RuntimeConfig } from "../runtime";
import { tenantIdFromResponse } from "../security/middleware";
import { AnalyticsService } from "../services/analyticsService";
import { AnalyticsProtocolDetailPayload, AnalyticsProtocolsPayload, ApiSuccessResponse } from "../types";
import { MemoryContributorRepository } from "./analyticsStore";

function analyticsServiceFor(res: Response, tenantId: string): AnalyticsService {
  const config = res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
  if (config.storageMode !== "database") {
    return new AnalyticsService(new MemoryContributorRepository(tenantId));
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaContributorRepository } = require(
    "../../db/implementations/PrismaContributorRepository"
  ) as typeof import("../../db/implementations/PrismaContributorRepository");
  return new AnalyticsService(new PrismaContributorRepository(tenantId));
}

export function listAnalyticsProtocols(_req: Request, res: Response, next: NextFunction): void {
  const tenantId = tenantIdFromResponse(res);
  const analyticsService = analyticsServiceFor(res, tenantId);

  analyticsService
    .listProtocolAnalytics()
    .then((payload: AnalyticsProtocolsPayload) => {
      const body: ApiSuccessResponse<AnalyticsProtocolsPayload> = {
        success: true,
        data: payload,
        generatedAt: new Date().toISOString(),
      };
      res.status(200).json(body);
    })
    .catch(next);
}

export function getAnalyticsProtocol(req: Request, res: Response, next: NextFunction): void {
  const id = req.params["id"] as string;
  const tenantId = tenantIdFromResponse(res);
  const analyticsService = analyticsServiceFor(res, tenantId);

  analyticsService
    .getProtocolAnalytics(id)
    .then((payload: AnalyticsProtocolDetailPayload | null) => {
      if (!payload) {
        next(new NotFoundError(`No analytics data found for protocol '${id}'.`));
        return;
      }
      const body: ApiSuccessResponse<AnalyticsProtocolDetailPayload> = {
        success: true,
        data: payload,
        generatedAt: new Date().toISOString(),
      };
      res.status(200).json(body);
    })
    .catch(next);
}
