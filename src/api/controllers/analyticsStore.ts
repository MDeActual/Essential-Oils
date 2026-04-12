/**
 * analyticsStore.ts — In-Memory Analytics Data Store
 *
 * Provides a simple in-memory registry of ContributorRecord entries for use
 * by the analytics controllers. Records are pre-seeded to populate both
 * eligible and excluded examples across multiple protocols so that integration
 * tests can verify correct pipeline behaviour.
 *
 * In production this would be replaced by a database-backed repository. The
 * store interface is intentionally read-only to match the API's read-only contract.
 *
 * LOCK-003: All records include `dataOrigin` and `exclusionStatus` fields.
 * Only records with dataOrigin === RealContributor, exclusionStatus === Included,
 * and adherenceScore >= 50 are analytics-eligible (enforced by the pipeline).
 */

import {
  ContributorRecord,
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
} from "../../analytics/types";

/** Seed contributor records for demonstration and integration testing. */
const CONTRIBUTOR_REGISTRY: ContributorRecord[] = [
  // Protocol 001 — two eligible records
  {
    recordId: "record-001",
    userId: "user-001",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 85,
    challengeCompletionRate: 90,
    recordedAt: "2026-04-10T10:00:00Z",
  },
  {
    recordId: "record-002",
    userId: "user-002",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 70,
    challengeCompletionRate: 75,
    recordedAt: "2026-04-11T10:00:00Z",
  },
  // Protocol 001 — one excluded record (low adherence)
  {
    recordId: "record-003",
    userId: "user-003",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    adherenceScore: 30,
    challengeCompletionRate: 40,
    recordedAt: "2026-04-11T11:00:00Z",
  },
  // Protocol 002 — one eligible record
  {
    recordId: "record-004",
    userId: "user-004",
    protocolId: "protocol-002",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 95,
    challengeCompletionRate: 100,
    recordedAt: "2026-04-12T09:00:00Z",
  },
];

/**
 * Returns all ContributorRecord entries in the registry.
 * Callers must not mutate the returned array or its contents.
 */
export function getAllContributorRecords(): ReadonlyArray<
  Readonly<ContributorRecord>
> {
  return CONTRIBUTOR_REGISTRY;
}
