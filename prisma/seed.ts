import "dotenv/config";

import { Prisma } from "../src/generated/prisma";
import { getPrismaClient } from "../src/db/client";
import {
  domainDataOriginToPrisma,
  domainExclusionReasonToPrisma,
  domainExclusionStatusToPrisma,
  domainProtocolStatusToPrisma,
} from "../src/db/mappers";

import { getAllProtocols } from "../src/api/controllers/protocolStore";
import { getAllContributorRecords } from "../src/api/controllers/analyticsStore";

const prisma = getPrismaClient();

async function main(): Promise<void> {
  const protocols = [...getAllProtocols()];
  const contributorRecords = [...getAllContributorRecords()];

  if (protocols.length === 0 || contributorRecords.length === 0) {
    throw new Error(
      `Seed sources must be non-empty; received ${protocols.length} protocols and ${contributorRecords.length} contributor records.`
    );
  }

  // Clear existing rows in dependency order to keep the seed idempotent.
  await prisma.outcomeLog.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.contributor.deleteMany();
  await prisma.blend.deleteMany();
  await prisma.protocol.deleteMany();

  const protocolWrite = await prisma.protocol.createMany({
    data: protocols.map((protocol) => ({
      protocolId: protocol.protocolId,
      version: protocol.version,
      userProfileId: protocol.userProfileId,
      goal: protocol.goal,
      durationDays: protocol.durationDays,
      status: domainProtocolStatusToPrisma(protocol.status),
      phases: protocol.phases as unknown as Prisma.InputJsonValue,
      challengeIds: protocol.challengeIds,
      createdAt: new Date(protocol.createdAt),
    })),
  });

  const contributorWrite = await prisma.contributor.createMany({
    data: contributorRecords.map((record) => ({
      recordId: record.recordId,
      userId: record.userId,
      protocolId: record.protocolId,
      dataOrigin: domainDataOriginToPrisma(record.dataOrigin),
      exclusionStatus: domainExclusionStatusToPrisma(record.exclusionStatus),
      exclusionReason: domainExclusionReasonToPrisma(record.exclusionReason),
      adherenceScore: record.adherenceScore,
      challengeCompletionRate: record.challengeCompletionRate,
      outcomeNotes: record.outcomeNotes ?? null,
      recordedAt: new Date(record.recordedAt),
    })),
  });

  const [protocolCount, contributorCount, canonicalProtocol] = await Promise.all([
    prisma.protocol.count(),
    prisma.contributor.count(),
    prisma.protocol.findUnique({
      where: { protocolId: "protocol-001" },
      select: { protocolId: true },
    }),
  ]);

  if (
    protocolWrite.count !== protocols.length ||
    contributorWrite.count !== contributorRecords.length ||
    protocolCount !== protocols.length ||
    contributorCount !== contributorRecords.length ||
    !canonicalProtocol
  ) {
    throw new Error(
      [
        "Seed verification failed.",
        `protocol writes=${protocolWrite.count}/${protocols.length}`,
        `protocol rows=${protocolCount}/${protocols.length}`,
        `contributor writes=${contributorWrite.count}/${contributorRecords.length}`,
        `contributor rows=${contributorCount}/${contributorRecords.length}`,
        `protocol-001=${canonicalProtocol ? "present" : "missing"}`,
      ].join(" ")
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seed verification passed: ${protocolCount} protocols and ${contributorCount} contributor records persisted.`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err: unknown) => {
    // eslint-disable-next-line no-console
    console.error("Prisma seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
