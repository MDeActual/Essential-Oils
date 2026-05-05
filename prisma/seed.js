/* eslint-disable no-console */

const { PrismaClient, $Enums } = require("../src/generated/prisma");

const prisma = new PrismaClient();

const SEED_PROTOCOLS = [
  {
    protocolId: "protocol-001",
    version: "1.0.0",
    userProfileId: "user-001",
    goal: "Stress relief and relaxation",
    durationDays: 28,
    status: $Enums.ProtocolStatus.ACTIVE,
    phases: [
      {
        phaseIndex: 0,
        label: "Preparation",
        durationDays: 7,
        blendIds: ["blend-lavender-chamomile"],
        oilIds: ["lavandula_angustifolia"],
        instructions: "Apply diluted lavender blend to pulse points each evening.",
      },
      {
        phaseIndex: 1,
        label: "Core Treatment",
        durationDays: 21,
        blendIds: ["blend-lavender-chamomile", "blend-bergamot-ylang"],
        oilIds: ["lavandula_angustifolia", "citrus_bergamia"],
        instructions:
          "Use diffuser blend for 30 minutes each morning and apply pulse-point blend each evening.",
      },
    ],
    challengeIds: ["challenge-001", "challenge-002"],
    createdAt: new Date("2026-04-10T08:00:00Z"),
  },
  {
    protocolId: "protocol-002",
    version: "1.0.0",
    userProfileId: "user-002",
    goal: "Energy and mental clarity",
    durationDays: 14,
    status: $Enums.ProtocolStatus.DRAFT,
    phases: [
      {
        phaseIndex: 0,
        label: "Foundation",
        durationDays: 14,
        blendIds: ["blend-peppermint-rosemary"],
        oilIds: ["mentha_piperita"],
        instructions: "Inhale peppermint blend for 5 minutes each morning.",
      },
    ],
    challengeIds: ["challenge-003"],
    createdAt: new Date("2026-04-11T09:00:00Z"),
  },
];

const SEED_CONTRIBUTORS = [
  {
    recordId: "record-001",
    userId: "user-001",
    protocolId: "protocol-001",
    dataOrigin: $Enums.DataOrigin.REAL_CONTRIBUTOR,
    exclusionStatus: $Enums.ExclusionStatus.INCLUDED,
    exclusionReason: null,
    adherenceScore: 85,
    challengeCompletionRate: 90,
    outcomeNotes: null,
    recordedAt: new Date("2026-04-10T10:00:00Z"),
  },
  {
    recordId: "record-002",
    userId: "user-002",
    protocolId: "protocol-001",
    dataOrigin: $Enums.DataOrigin.REAL_CONTRIBUTOR,
    exclusionStatus: $Enums.ExclusionStatus.INCLUDED,
    exclusionReason: null,
    adherenceScore: 70,
    challengeCompletionRate: 75,
    outcomeNotes: null,
    recordedAt: new Date("2026-04-11T10:00:00Z"),
  },
  {
    recordId: "record-003",
    userId: "user-003",
    protocolId: "protocol-001",
    dataOrigin: $Enums.DataOrigin.REAL_CONTRIBUTOR,
    exclusionStatus: $Enums.ExclusionStatus.EXCLUDED,
    exclusionReason: $Enums.ExclusionReason.ADHERENCE_BELOW_THRESHOLD,
    adherenceScore: 30,
    challengeCompletionRate: 40,
    outcomeNotes: null,
    recordedAt: new Date("2026-04-11T11:00:00Z"),
  },
  {
    recordId: "record-004",
    userId: "user-004",
    protocolId: "protocol-002",
    dataOrigin: $Enums.DataOrigin.REAL_CONTRIBUTOR,
    exclusionStatus: $Enums.ExclusionStatus.INCLUDED,
    exclusionReason: null,
    adherenceScore: 95,
    challengeCompletionRate: 100,
    outcomeNotes: null,
    recordedAt: new Date("2026-04-12T09:00:00Z"),
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run prisma seed.");
  }

  for (const protocol of SEED_PROTOCOLS) {
    await prisma.protocol.upsert({
      where: { protocolId: protocol.protocolId },
      update: {
        version: protocol.version,
        userProfileId: protocol.userProfileId,
        goal: protocol.goal,
        durationDays: protocol.durationDays,
        status: protocol.status,
        phases: protocol.phases,
        challengeIds: protocol.challengeIds,
        createdAt: protocol.createdAt,
      },
      create: protocol,
    });
  }

  for (const contributor of SEED_CONTRIBUTORS) {
    await prisma.contributor.upsert({
      where: { recordId: contributor.recordId },
      update: {
        userId: contributor.userId,
        protocolId: contributor.protocolId,
        dataOrigin: contributor.dataOrigin,
        exclusionStatus: contributor.exclusionStatus,
        exclusionReason: contributor.exclusionReason,
        adherenceScore: contributor.adherenceScore,
        challengeCompletionRate: contributor.challengeCompletionRate,
        outcomeNotes: contributor.outcomeNotes,
        recordedAt: contributor.recordedAt,
      },
      create: contributor,
    });
  }

  console.log("Seeded protocols and contributor records.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

