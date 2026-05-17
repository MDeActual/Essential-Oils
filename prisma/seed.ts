import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma";

import { ProtocolStatus } from "../src/protocol/types";
import { DataOrigin, ExclusionReason, ExclusionStatus } from "../src/analytics/types";

import { getAllProtocols } from "../src/api/controllers/protocolStore";
import { getAllContributorRecords } from "../src/api/controllers/analyticsStore";

function protocolStatusToDb(
  status: ProtocolStatus
): "DRAFT" | "ACTIVE" | "COMPLETED" | "DEPRECATED" {
  switch (status) {
    case ProtocolStatus.Draft:
      return "DRAFT";
    case ProtocolStatus.Active:
      return "ACTIVE";
    case ProtocolStatus.Completed:
      return "COMPLETED";
    case ProtocolStatus.Deprecated:
      return "DEPRECATED";
  }
}

function dataOriginToDb(
  origin: DataOrigin
): "REAL_CONTRIBUTOR" | "SYNTHETIC_SIMULATION" {
  switch (origin) {
    case DataOrigin.RealContributor:
      return "REAL_CONTRIBUTOR";
    case DataOrigin.SyntheticSimulation:
      return "SYNTHETIC_SIMULATION";
  }
}

function exclusionStatusToDb(status: ExclusionStatus): "INCLUDED" | "EXCLUDED" {
  switch (status) {
    case ExclusionStatus.Included:
      return "INCLUDED";
    case ExclusionStatus.Excluded:
      return "EXCLUDED";
  }
}

function exclusionReasonToDb(
  reason: ExclusionReason
): "ADHERENCE_BELOW_THRESHOLD" | "USER_REQUEST" | "INVALID_DATA" | "OTHER" {
  switch (reason) {
    case ExclusionReason.AdherenceBelowThreshold:
      return "ADHERENCE_BELOW_THRESHOLD";
    case ExclusionReason.UserRequest:
      return "USER_REQUEST";
    case ExclusionReason.InvalidData:
      return "INVALID_DATA";
    case ExclusionReason.Other:
      return "OTHER";
  }
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  const protocols = getAllProtocols();
  const contributorRecords = getAllContributorRecords();

  await prisma.$transaction(async (tx) => {
    // Clear existing rows to keep seed idempotent.
    await tx.outcomeLog.deleteMany();
    await tx.challenge.deleteMany();
    await tx.contributor.deleteMany();
    await tx.blend.deleteMany();
    await tx.protocol.deleteMany();

    for (const protocol of protocols) {
      await tx.protocol.upsert({
        where: { protocolId: protocol.protocolId },
        update: {
          version: protocol.version,
          userProfileId: protocol.userProfileId,
          goal: protocol.goal,
          durationDays: protocol.durationDays,
          status: protocolStatusToDb(protocol.status),
          phases: protocol.phases,
          challengeIds: protocol.challengeIds,
          createdAt: new Date(protocol.createdAt),
        },
        create: {
          protocolId: protocol.protocolId,
          version: protocol.version,
          userProfileId: protocol.userProfileId,
          goal: protocol.goal,
          durationDays: protocol.durationDays,
          status: protocolStatusToDb(protocol.status),
          phases: protocol.phases,
          challengeIds: protocol.challengeIds,
          createdAt: new Date(protocol.createdAt),
        },
      });
    }

    for (const record of contributorRecords) {
      await tx.contributor.upsert({
        where: { recordId: record.recordId },
        update: {
          userId: record.userId,
          protocolId: record.protocolId,
          dataOrigin: dataOriginToDb(record.dataOrigin),
          exclusionStatus: exclusionStatusToDb(record.exclusionStatus),
          exclusionReason: record.exclusionReason
            ? exclusionReasonToDb(record.exclusionReason)
            : null,
          adherenceScore: record.adherenceScore,
          challengeCompletionRate: record.challengeCompletionRate,
          outcomeNotes: record.outcomeNotes ?? null,
          recordedAt: new Date(record.recordedAt),
        },
        create: {
          recordId: record.recordId,
          userId: record.userId,
          protocolId: record.protocolId,
          dataOrigin: dataOriginToDb(record.dataOrigin),
          exclusionStatus: exclusionStatusToDb(record.exclusionStatus),
          exclusionReason: record.exclusionReason
            ? exclusionReasonToDb(record.exclusionReason)
            : null,
          adherenceScore: record.adherenceScore,
          challengeCompletionRate: record.challengeCompletionRate,
          outcomeNotes: record.outcomeNotes ?? null,
          recordedAt: new Date(record.recordedAt),
        },
      });
    }
  });

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error("Prisma seed failed:", err);
  process.exitCode = 1;
});
