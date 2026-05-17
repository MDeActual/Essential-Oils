/**
 * analyticsController.ts — Analytics Endpoint Controllers
 *
 * Handles:
 *   GET /analytics/protocols      — runs the protocol segmentation pipeline
 *                                   and returns per-protocol cohort summaries
 *   GET /analytics/protocols/:id  — returns cohort metrics for a single protocol
 *
 * Controllers delegate pipeline execution to src/analytics/pipeline.ts and
 * shape results into the ApiSuccessResponse envelope. No analytics logic is
 * duplicated here — all LOCK-003 enforcement and M-004 boundary preservation
 * happens inside the pipeline module.
 *
 * LOCK-003: All ContributorRecords flowing through this layer pass through
 * validateContributorRecord() inside runProtocolSegmentPipeline() before use.
 *
 * MOAT NOTICE (M-004): This controller exposes only structural cohort metrics.
 * The signal extraction methodology, weighting scheme, and protocol evolution
 * recommendation logic are moat-protected and must not be reconstructed from
 * or embedded in these responses.
 */

import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../middleware/errorHandler";
import {
  AnalyticsProtocolDetailPayload,
  AnalyticsProtocolsPayload,
  ApiSuccessResponse,
} from "../types";
import { AnalyticsService } from "../services/analyticsService";
import { runProtocolSegmentPipeline } from "../../analytics/pipeline";
import { getAllContributorRecords } from "./analyticsStore";

const analyticsService = process.env["DATABASE_URL"]
  ? new AnalyticsService(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      new (require("../../db/implementations/PrismaContributorRepository").PrismaContributorRepository)()
    )
  : null;

/**
 * GET /analytics/protocols
 *
 * Runs the full protocol segmentation pipeline over all contributor records
 * and returns a summary of per-protocol cohort metrics.
 */
export function listAnalyticsProtocols(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const serviceCall = analyticsService
    ? analyticsService.listProtocolAnalytics()
    : Promise.resolve((() => {
        const records = getAllContributorRecords();
        const result = runProtocolSegmentPipeline([...records]);
        if (!result.success) {
          const message =
            result.errors.length > 0
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

/**
 * GET /analytics/protocols/:id
 *
 * Returns detailed cohort metrics for a single protocol identified by :id.
 * Returns 404 if no analytics-eligible records exist for the given protocolId.
 */
export function getAnalyticsProtocol(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = req.params["id"] as string;
  const serviceCall = analyticsService
    ? analyticsService.getProtocolAnalytics(id)
    : Promise.resolve((() => {
        const records = getAllContributorRecords();
        const result = runProtocolSegmentPipeline([...records]);
        if (!result.success) {
          const message =
            result.errors.length > 0
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
        next(
          new NotFoundError(
            `No analytics data found for protocol '${id}'.`
          )
        );
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
