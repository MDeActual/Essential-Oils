import { runProtocolSegmentPipeline, segmentByProtocol } from "../pipeline";
import {
  ContributorRecord,
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
} from "../types";

function included(
  recordId: string,
  protocolId: string,
  adherenceScore: number
): ContributorRecord {
  return {
    recordId,
    userId: `user-${recordId}`,
    protocolId,
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore,
    challengeCompletionRate: 80,
    recordedAt: "2026-04-11T10:00:00Z",
  };
}

function excluded(
  recordId: string,
  protocolId: string
): ContributorRecord {
  return {
    recordId,
    userId: `user-${recordId}`,
    protocolId,
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    adherenceScore: 30,
    challengeCompletionRate: 40,
    recordedAt: "2026-04-11T10:00:00Z",
  };
}

describe("protocol exclusion attribution", () => {
  it("attributes excluded records only to their matching protocol segment", () => {
    const segments = segmentByProtocol(
      [
        included("record-001", "protocol-001", 70),
        included("record-002", "protocol-001", 85),
        included("record-004", "protocol-002", 95),
      ],
      [excluded("record-003", "protocol-001")]
    );

    const protocol001 = segments.find(
      (segment) => segment.protocolId === "protocol-001"
    );
    const protocol002 = segments.find(
      (segment) => segment.protocolId === "protocol-002"
    );

    expect(protocol001?.metrics.excludedRecordCount).toBe(1);
    expect(
      protocol001?.metrics.exclusionBreakdown.adherence_below_threshold
    ).toBe(1);
    expect(protocol002?.metrics.excludedRecordCount).toBe(0);
    expect(protocol002?.metrics.exclusionBreakdown).toEqual({});
  });

  it("preserves report-level totals while exposing protocol detail exclusions", () => {
    const result = runProtocolSegmentPipeline([
      included("record-001", "protocol-001", 70),
      included("record-002", "protocol-001", 85),
      excluded("record-003", "protocol-001"),
      included("record-004", "protocol-002", 95),
    ]);

    expect(result.success).toBe(true);
    expect(result.protocolCount).toBe(2);
    expect(result.totalEligibleRecords).toBe(3);
    expect(result.totalExcludedRecords).toBe(1);

    const protocol001 = result.segments?.find(
      (segment) => segment.protocolId === "protocol-001"
    );
    expect(protocol001?.metrics.eligibleRecordCount).toBe(2);
    expect(protocol001?.metrics.excludedRecordCount).toBe(1);
    expect(protocol001?.metrics.averageAdherenceScore).toBe(77.5);
    expect(protocol001?.metrics.minAdherenceScore).toBe(70);
    expect(protocol001?.metrics.maxAdherenceScore).toBe(85);
  });
});
