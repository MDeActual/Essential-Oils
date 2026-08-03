import { NextFunction, Request, Response } from "express";
import { runProtocolSegmentPipeline } from "../../analytics/pipeline";
import { NotFoundError } from "../middleware/errorHandler";
import type { RuntimeConfig } from "../runtime";
import { tenantIdFromResponse } from "../security/middleware";
import { AnalyticsService } from "../services/analyticsService";
import { AnalyticsProtocolDetailPayload, AnalyticsProtocolsPayload, ApiSuccessResponse } from "../types";
import { getAllContributorRecords } from "./analyticsStore";

function analyticsServiceFor(res: Response, tenantId: string): AnalyticsService | null {
  const config = res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
  if (config.storageMode !== "database") return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaContributorRepository } = require(
    "../../db/implementations/PrismaContributorRepository"
  ) as typeof import("../../db/implementations/PrismaContributorRepository");
  return new AnalyticsService(new PrismaContributorRepository(tenantId));
}

export function listAnalyticsProtocols(_req: Request, res: Response, next: NextFunction): void {
  const tenantId = tenantIdFromResponse(res);
  const analyticsService = analyticsServiceFor(res, tenantId);
  const serviceCall = analyticsService
    ? analyticsService.listProtocolAnalytics()
    : Promise.resolve((() => {
        const result = runProtocolSegmentPipeline([...getAllContributorRecords(tenantId)]);
        if (!result.success) {
          throw new Error(result.errors[0]?.message ?? "Analytics pipeline failed.");
        }
        return {
          protocolCount: result.protocolCount ?? 0,
          totalEligibleRecords: result.totalEligibleRecords ?? 0,
          totalExcludedRecords: result.totalExcludedRecords ?? 0,
          segments: (result.segments ?? []).map((segment) => ({
            protocolId: segment.protocolId,
            eligibleRecordCount: segment.metrics.eligibleRecordCount,
            averageAdherenceScore: segment.metrics.averageAdherenceScore,
            averageChallengeCompletionRate: segment.metrics.averageChallengeCompletionRate,
          })),
          generatedAt: result.generatedAt ?? new Date().toISOString(),
        };
      })());

  serviceCall
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
  const serviceCall = analyticsService
    ? analyticsService.getProtocolAnalytics(id)
    : Promise.resolve((() => {
        const result = runProtocolSegmentPipeline([...getAllContributorRecords(tenantId)]);
        if (!result.success) {
          throw new Error(result.errors[0]?.message ?? "Analytics pipeline failed.");
        }
        const segment = (result.segments ?? []).find((candidate) => candidate.protocolId === id);
        if (!segment) return null;
        return {
          protocolId: segment.protocolId,
          eligibleRecordCount: segment.metrics.eligibleRecordCount,
          excludedRecordCount: segment.metrics.excludedRecordCount,
          averageAdherenceScore: segment.metrics.averageAdherenceScore,
          averageChallengeCompletionRate: segment.metrics.averageChallengeCompletionRate,
          minAdherenceScore: segment.metrics.minAdherenceScore,
          maxAdherenceScore: segment.metrics.maxAdherenceScore,
          exclusionBreakdown: segment.metrics.exclusionBreakdown,
          computedAt: segment.metrics.computedAt,
        };
      })());

  serviceCall
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
