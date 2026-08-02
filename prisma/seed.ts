import "dotenv/config";

import { getPrismaClient } from "../src/db/client";
import {
  domainDataOriginToPrisma,
  domainExclusionReasonToPrisma,
  domainExclusionStatusToPrisma,
  domainProtocolStatusToPrisma,
} from "../src/db/mappers";

import { getAllProtocols } from "../src/api/controllers/protocolStore";
import { getAllContributorRecords } from "../src/api/controllers/analyticsStore";

async function main(): Promise<void> {
  const prisma = getPrismaClient();

  try {
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
        const status = domainProtocolStatusToPrisma(protocol.status);

        await tx.protocol.upsert({
          where: { protocolId: protocol.protocolId },
          update: {
            version: protocol.version,
            userProfileId: protocol.userProfileId,
            goal: protocol.goal,
            durationDays: protocol.durationDays,
            status,
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
            status,
            phases: protocol.phases,
            challengeIds: protocol.challengeIds,
            createdAt: new Date(protocol.createdAt),
          },
        });
      }

      for (const record of contributorRecords) {
        const dataOrigin = domainDataOriginToPrisma(record.dataOrigin);
        const exclusionStatus = domainExclusionStatusToPrisma(record.exclusionStatus);
        const exclusionReason = domainExclusionReasonToPrisma(record.exclusionReason);

        await tx.contributor.upsert({
          where: { recordId: record.recordId },
          update: {
            userId: record.userId,
            protocolId: record.protocolId,
            dataOrigin,
            exclusionStatus,
            exclusionReason,
            adherenceScore: record.adherenceScore,
            challengeCompletionRate: record.challengeCompletionRate,
            outcomeNotes: record.outcomeNotes ?? null,
            recordedAt: new Date(record.recordedAt),
          },
          create: {
            recordId: record.recordId,
            userId: record.userId,
            protocolId: record.protocolId,
            dataOrigin,
            exclusionStatus,
            exclusionReason,
            adherenceScore: record.adherenceScore,
            challengeCompletionRate: record.challengeCompletionRate,
            outcomeNotes: record.outcomeNotes ?? null,
            recordedAt: new Date(record.recordedAt),
          },
        });
      }
    });

    const [protocolCount, contributorCount, canonicalProtocol] = await Promise.all([
      prisma.protocol.count(),
      prisma.contributor.count(),
      prisma.protocol.findUnique({
        where: { protocolId: "protocol-001" },
        select: { protocolId: true },
      }),
    ]);

    if (protocolCount !== protocols.length) {
      throw new Error(
        `Seed verification failed for protocols: expected ${protocols.length}, found ${protocolCount}.`
      );
    }

    if (contributorCount !== contributorRecords.length) {
      throw new Error(
        `Seed verification failed for contributors: expected ${contributorRecords.length}, found ${contributorCount}.`
      );
    }

    if (!canonicalProtocol) {
      throw new Error("Seed verification failed: canonical protocol 'protocol-001' was not persisted.");
    }

    // eslint-disable-next-line no-console
    console.log(
      `Seed verification passed: ${protocolCount} protocols and ${contributorCount} contributor records persisted.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error("Prisma seed failed:", err);
  process.exitCode = 1;
});
