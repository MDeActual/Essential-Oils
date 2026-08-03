/**
 * analyticsController.ts — Public analytics endpoint controllers
 *
 * Storage selection is controlled by the validated runtime configuration.
 * LOCK-003 validation and protected analytics internals remain inside the
 * existing pipeline and service layers.
 */

import { NextFunction, Request, Response } from "express";
import { runProtocolSegmentPipeline } from "../../analytics/pipeline";
import { RuntimeConfig } from "../../config/runtime";
import { NotFoundError } from "../middleware/errorHandler";
import { AnalyticsService } from "../services/analyticsService";
import {
  AnalyticsProtocolDetailPayload,
  AnalyticsProtocolsPayload,
  ApiSuccessResponse,
} from "../types";
import { getAllContributorRecords } from "./analyticsStore";

let databaseAnalyticsService: AnalyticsService | undefined;

function analyticsServiceFor(res: Response): AnalyticsService | null {
  const config = res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
  if (config.storageMode !== "database") return null;
  if (!databaseAnalyticsService) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaContributorRepository } = require(
      "../../db/implementations/PrismaContributorRepository"
    ) as typeof import("../../db/implementations/PrismaContributorRepository");
    databaseAnalyticsService = new AnalyticsService(
      new PrismaContributorRepository()
    );
  }
  return databaseAnalyticsService;
}

export function listAnalyticsProtocols(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const analyticsService = analyticsServiceFor(res);
  const serviceCall = analyticsService
    ? analyticsService.listProtocolAnalytics()
    : Promise.resolve((() => {
        const records = getAllContributorRecords();
        const result = runProtocolSegmentPipeline([...records]);
        if (!result.success) {
          const message = result.errors.length > 0
            ? result.errors[0].message
            : "Analytics pipeline failed.";
          throw new Error(message);
        }
        return {
          protocolCount: result.protocolCount ?? 0,
          totalEligibleRecords: result.totalEligibleRecords ?? 0,
          totalExcludedRecords: result.totalExcludedRecords ?? 0,
          segments: (result.segments ?? []).map((seg) => ({
            protocolId: seg.protocolId,
            eligibleRecordCount: seg.metrics.eligibleRecordCount,
            averageAdherenceScore: seg.metrics.averageAdherenceScore,
            averageChallengeCompletionRate:
              seg.metrics.averageChallengeCompletionRate,
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

export function getAnalyticsProtocol(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = req.params["id"] as string;
  const analyticsService = analyticsServiceFor(res);
  const serviceCall = analyticsService
    ? analyticsService.getProtocolAnalytics(id)
    : Promise.resolve((() => {
        const records = getAllContributorRecords();
        const result = runProtocolSegmentPipeline([...records]);
        if (!result.success) {
          const message = result.errors.length > 0
            ? result.errors[0].message
            : "Analytics pipeline failed.";
          throw new Error(message);
        }
        const segment = (result.segments ?? []).find(
          (seg) => seg.protocolId === id
        );
        if (!segment) return null;
        return {
          protocolId: segment.protocolId,
          eligibleRecordCount: segment.metrics.eligibleRecordCount,
          excludedRecordCount: segment.metrics.excludedRecordCount,
          averageAdherenceScore: segment.metrics.averageAdherenceScore,
          averageChallengeCompletionRate:
            segment.metrics.averageChallengeCompletionRate,
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
