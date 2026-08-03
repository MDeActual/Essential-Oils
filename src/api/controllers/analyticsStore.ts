import {
  ContributorRecord,
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
} from "../../analytics/types";
import { LOCAL_DEVELOPMENT_TENANT_ID, validateTenantId } from "../../db/tenant";

const CONTRIBUTOR_REGISTRY: ContributorRecord[] = [
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

export function getAllContributorRecords(
  tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID
): ReadonlyArray<Readonly<ContributorRecord>> {
  return validateTenantId(tenantId) === LOCAL_DEVELOPMENT_TENANT_ID
    ? CONTRIBUTOR_REGISTRY
    : [];
}
