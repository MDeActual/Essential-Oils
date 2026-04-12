/**
 * mappers.ts — Prisma ↔ Domain Type Mappers
 *
 * Provides bidirectional conversion utilities between Prisma-generated enum
 * values (ALL_CAPS keys) and the application-layer enum values (string literals).
 * Also provides entity-level mapper functions that convert Prisma model rows
 * to the canonical domain types used throughout src/.
 *
 * These mappers are an infrastructure concern only — no business logic is
 * permitted here.
 */

import {
  Contributor as PrismaContributor,
  Protocol as PrismaProtocol,
  Challenge as PrismaChallenge,
  Blend as PrismaBlend,
  OutcomeLog as PrismaOutcomeLog,
  $Enums,
} from "../generated/prisma";

import { ContributorRecord, DataOrigin, ExclusionStatus, ExclusionReason } from "../analytics/types";
import { Protocol, ProtocolPhase, ProtocolStatus, Challenge, ChallengeType, ChallengeCompletionStatus } from "../protocol/types";
import { Blend, BlendOilEntry, BlendSafetyStatus } from "../blend/types";
import { ApplicationMethod } from "../ontology/types";
import { OutcomeLog } from "./repositories/outcomeLogRepository";

// ---------------------------------------------------------------------------
// DataOrigin
// ---------------------------------------------------------------------------

export function prismaDataOriginToDomain(v: $Enums.DataOrigin): DataOrigin {
  switch (v) {
    case $Enums.DataOrigin.REAL_CONTRIBUTOR:
      return DataOrigin.RealContributor;
    case $Enums.DataOrigin.SYNTHETIC_SIMULATION:
      return DataOrigin.SyntheticSimulation;
  }
}

export function domainDataOriginToPrisma(v: DataOrigin): $Enums.DataOrigin {
  switch (v) {
    case DataOrigin.RealContributor:
      return $Enums.DataOrigin.REAL_CONTRIBUTOR;
    case DataOrigin.SyntheticSimulation:
      return $Enums.DataOrigin.SYNTHETIC_SIMULATION;
  }
}

// ---------------------------------------------------------------------------
// ExclusionStatus
// ---------------------------------------------------------------------------

export function prismaExclusionStatusToDomain(v: $Enums.ExclusionStatus): ExclusionStatus {
  switch (v) {
    case $Enums.ExclusionStatus.INCLUDED:
      return ExclusionStatus.Included;
    case $Enums.ExclusionStatus.EXCLUDED:
      return ExclusionStatus.Excluded;
  }
}

export function domainExclusionStatusToPrisma(v: ExclusionStatus): $Enums.ExclusionStatus {
  switch (v) {
    case ExclusionStatus.Included:
      return $Enums.ExclusionStatus.INCLUDED;
    case ExclusionStatus.Excluded:
      return $Enums.ExclusionStatus.EXCLUDED;
  }
}

// ---------------------------------------------------------------------------
// ExclusionReason
// ---------------------------------------------------------------------------

export function prismaExclusionReasonToDomain(v: $Enums.ExclusionReason | null): ExclusionReason | undefined {
  if (v === null) return undefined;
  switch (v) {
    case $Enums.ExclusionReason.ADHERENCE_BELOW_THRESHOLD:
      return ExclusionReason.AdherenceBelowThreshold;
    case $Enums.ExclusionReason.SYNTHETIC_DATA:
      return ExclusionReason.SyntheticData;
    case $Enums.ExclusionReason.MANUAL_FLAG:
      return ExclusionReason.ManualFlag;
    case $Enums.ExclusionReason.INCOMPLETE_RECORD:
      return ExclusionReason.IncompleteRecord;
  }
}

export function domainExclusionReasonToPrisma(v: ExclusionReason | undefined): $Enums.ExclusionReason | null {
  if (v === undefined) return null;
  switch (v) {
    case ExclusionReason.AdherenceBelowThreshold:
      return $Enums.ExclusionReason.ADHERENCE_BELOW_THRESHOLD;
    case ExclusionReason.SyntheticData:
      return $Enums.ExclusionReason.SYNTHETIC_DATA;
    case ExclusionReason.ManualFlag:
      return $Enums.ExclusionReason.MANUAL_FLAG;
    case ExclusionReason.IncompleteRecord:
      return $Enums.ExclusionReason.INCOMPLETE_RECORD;
  }
}

// ---------------------------------------------------------------------------
// ProtocolStatus
// ---------------------------------------------------------------------------

export function prismaProtocolStatusToDomain(v: $Enums.ProtocolStatus): ProtocolStatus {
  switch (v) {
    case $Enums.ProtocolStatus.DRAFT:
      return ProtocolStatus.Draft;
    case $Enums.ProtocolStatus.ACTIVE:
      return ProtocolStatus.Active;
    case $Enums.ProtocolStatus.COMPLETED:
      return ProtocolStatus.Completed;
    case $Enums.ProtocolStatus.DEPRECATED:
      return ProtocolStatus.Deprecated;
  }
}

export function domainProtocolStatusToPrisma(v: ProtocolStatus): $Enums.ProtocolStatus {
  switch (v) {
    case ProtocolStatus.Draft:
      return $Enums.ProtocolStatus.DRAFT;
    case ProtocolStatus.Active:
      return $Enums.ProtocolStatus.ACTIVE;
    case ProtocolStatus.Completed:
      return $Enums.ProtocolStatus.COMPLETED;
    case ProtocolStatus.Deprecated:
      return $Enums.ProtocolStatus.DEPRECATED;
  }
}

// ---------------------------------------------------------------------------
// ChallengeType
// ---------------------------------------------------------------------------

export function prismaChallengeTypeToDomain(v: $Enums.ChallengeType): ChallengeType {
  switch (v) {
    case $Enums.ChallengeType.ADHERENCE:
      return ChallengeType.Adherence;
    case $Enums.ChallengeType.EDUCATIONAL:
      return ChallengeType.Educational;
    case $Enums.ChallengeType.EXPERIENTIAL:
      return ChallengeType.Experiential;
  }
}

export function domainChallengeTypeToPrisma(v: ChallengeType): $Enums.ChallengeType {
  switch (v) {
    case ChallengeType.Adherence:
      return $Enums.ChallengeType.ADHERENCE;
    case ChallengeType.Educational:
      return $Enums.ChallengeType.EDUCATIONAL;
    case ChallengeType.Experiential:
      return $Enums.ChallengeType.EXPERIENTIAL;
  }
}

// ---------------------------------------------------------------------------
// ChallengeCompletionStatus
// ---------------------------------------------------------------------------

export function prismaChallengeCompletionStatusToDomain(
  v: $Enums.ChallengeCompletionStatus
): ChallengeCompletionStatus {
  switch (v) {
    case $Enums.ChallengeCompletionStatus.PENDING:
      return ChallengeCompletionStatus.Pending;
    case $Enums.ChallengeCompletionStatus.COMPLETED:
      return ChallengeCompletionStatus.Completed;
    case $Enums.ChallengeCompletionStatus.SKIPPED:
      return ChallengeCompletionStatus.Skipped;
  }
}

export function domainChallengeCompletionStatusToPrisma(
  v: ChallengeCompletionStatus
): $Enums.ChallengeCompletionStatus {
  switch (v) {
    case ChallengeCompletionStatus.Pending:
      return $Enums.ChallengeCompletionStatus.PENDING;
    case ChallengeCompletionStatus.Completed:
      return $Enums.ChallengeCompletionStatus.COMPLETED;
    case ChallengeCompletionStatus.Skipped:
      return $Enums.ChallengeCompletionStatus.SKIPPED;
  }
}

// ---------------------------------------------------------------------------
// ApplicationMethod
// ---------------------------------------------------------------------------

export function prismaApplicationMethodToDomain(v: $Enums.ApplicationMethod): ApplicationMethod {
  switch (v) {
    case $Enums.ApplicationMethod.TOPICAL:
      return ApplicationMethod.Topical;
    case $Enums.ApplicationMethod.AROMATIC:
      return ApplicationMethod.Aromatic;
    case $Enums.ApplicationMethod.INTERNAL:
      return ApplicationMethod.Internal;
  }
}

export function domainApplicationMethodToPrisma(v: ApplicationMethod): $Enums.ApplicationMethod {
  switch (v) {
    case ApplicationMethod.Topical:
      return $Enums.ApplicationMethod.TOPICAL;
    case ApplicationMethod.Aromatic:
      return $Enums.ApplicationMethod.AROMATIC;
    case ApplicationMethod.Internal:
      return $Enums.ApplicationMethod.INTERNAL;
  }
}

// ---------------------------------------------------------------------------
// BlendSafetyStatus
// ---------------------------------------------------------------------------

export function prismaBlendSafetyStatusToDomain(v: $Enums.BlendSafetyStatus): BlendSafetyStatus {
  switch (v) {
    case $Enums.BlendSafetyStatus.VALIDATED:
      return BlendSafetyStatus.Validated;
    case $Enums.BlendSafetyStatus.PENDING:
      return BlendSafetyStatus.Pending;
    case $Enums.BlendSafetyStatus.REJECTED:
      return BlendSafetyStatus.Rejected;
  }
}

export function domainBlendSafetyStatusToPrisma(v: BlendSafetyStatus): $Enums.BlendSafetyStatus {
  switch (v) {
    case BlendSafetyStatus.Validated:
      return $Enums.BlendSafetyStatus.VALIDATED;
    case BlendSafetyStatus.Pending:
      return $Enums.BlendSafetyStatus.PENDING;
    case BlendSafetyStatus.Rejected:
      return $Enums.BlendSafetyStatus.REJECTED;
  }
}

// ---------------------------------------------------------------------------
// Entity mappers
// ---------------------------------------------------------------------------

/** Maps a Prisma Contributor row to the domain ContributorRecord type. */
export function prismaContributorToDomain(row: PrismaContributor): ContributorRecord {
  const result: ContributorRecord = {
    recordId: row.recordId,
    userId: row.userId,
    protocolId: row.protocolId,
    dataOrigin: prismaDataOriginToDomain(row.dataOrigin),
    exclusionStatus: prismaExclusionStatusToDomain(row.exclusionStatus),
    adherenceScore: row.adherenceScore,
    challengeCompletionRate: row.challengeCompletionRate,
    recordedAt: row.recordedAt.toISOString(),
  };
  const exclusionReason = prismaExclusionReasonToDomain(row.exclusionReason);
  if (exclusionReason !== undefined) result.exclusionReason = exclusionReason;
  if (row.outcomeNotes !== null) result.outcomeNotes = row.outcomeNotes;
  return result;
}

/** Maps a Prisma Protocol row to the domain Protocol type. */
export function prismaProtocolToDomain(row: PrismaProtocol): Protocol {
  return {
    protocolId: row.protocolId,
    version: row.version,
    userProfileId: row.userProfileId,
    goal: row.goal,
    durationDays: row.durationDays,
    status: prismaProtocolStatusToDomain(row.status),
    phases: row.phases as unknown as ProtocolPhase[],
    challengeIds: row.challengeIds,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Maps a Prisma Challenge row to the domain Challenge type. */
export function prismaChallengeToDomain(row: PrismaChallenge): Challenge {
  const result: Challenge = {
    challengeId: row.challengeId,
    protocolId: row.protocolId,
    type: prismaChallengeTypeToDomain(row.type),
    prompt: row.prompt,
    dueDay: row.dueDay,
    completionStatus: prismaChallengeCompletionStatusToDomain(row.completionStatus),
  };
  if (row.response !== null) result.response = row.response;
  return result;
}

/** Maps a Prisma Blend row to the domain Blend type. */
export function prismaBlendToDomain(row: PrismaBlend): Blend {
  return {
    blendId: row.blendId,
    oils: row.oils as unknown as BlendOilEntry[],
    synergyScore: row.synergyScore,
    applicationMethod: prismaApplicationMethodToDomain(row.applicationMethod),
    intendedEffect: row.intendedEffect,
    safetyStatus: prismaBlendSafetyStatusToDomain(row.safetyStatus),
    createdAt: row.createdAt.toISOString(),
    lastReviewedAt: row.lastReviewedAt.toISOString(),
  };
}

/** Maps a Prisma OutcomeLog row to the domain OutcomeLog type. */
export function prismaOutcomeLogToDomain(row: PrismaOutcomeLog): OutcomeLog {
  return {
    id: row.id,
    contributorId: row.contributorId,
    protocolId: row.protocolId,
    notes: row.notes,
    loggedAt: row.loggedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}
