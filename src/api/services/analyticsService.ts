import { IContributorRepository } from "../../db/repositories/contributorRepository";
import { DataOrigin } from "../../analytics/types";
import { runProtocolSegmentPipeline } from "../../analytics/pipeline";
import {
  AnalyticsProtocolDetailPayload,
  AnalyticsProtocolsPayload,
  AnalyticsSegmentSummary,
} from "../types";

export class AnalyticsService {
  constructor(private readonly contributorRepository: IContributorRepository) {}

  async listProtocolAnalytics(): Promise<AnalyticsProtocolsPayload> {
    // LOCK-003: only real contributors are analytics eligible.
    const { items } = await this.contributorRepository.findByDataOrigin(
      DataOrigin.RealContributor
    );

    const result = runProtocolSegmentPipeline([...items]);
    if (!result.success) {
      const message =
        result.errors.length > 0
          ? result.errors[0].message
          : "Analytics pipeline failed.";
      throw new Error(message);
    }

    const segments: AnalyticsSegmentSummary[] = (result.segments ?? []).map(
      (seg) => ({
        protocolId: seg.protocolId,
        eligibleRecordCount: seg.metrics.eligibleRecordCount,
        averageAdherenceScore: seg.metrics.averageAdherenceScore,
        averageChallengeCompletionRate:
          seg.metrics.averageChallengeCompletionRate,
      })
    );

    return {
      protocolCount: result.protocolCount ?? 0,
      totalEligibleRecords: result.totalEligibleRecords ?? 0,
      totalExcludedRecords: result.totalExcludedRecords ?? 0,
      segments,
      generatedAt: result.generatedAt ?? new Date().toISOString(),
    };
  }

  async getProtocolAnalytics(
    protocolId: string
  ): Promise<AnalyticsProtocolDetailPayload | null> {
    const { items } = await this.contributorRepository.findByDataOrigin(
      DataOrigin.RealContributor
    );

    const result = runProtocolSegmentPipeline([...items]);
    if (!result.success) {
      const message =
        result.errors.length > 0
          ? result.errors[0].message
          : "Analytics pipeline failed.";
      throw new Error(message);
    }

    const segment = (result.segments ?? []).find(
      (seg) => seg.protocolId === protocolId
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
  }
}
