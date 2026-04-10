import { prisma } from "../db/client";
import { DataOrigin } from "../types";

export const outcomeRepository = {
  async create(input: {
    contributorId: string;
    challengeId: string;
    protocolId: string;
    adherence: number;
    signals: Record<string, string | number>;
    dataOrigin: DataOrigin;
  }) {
    return prisma.outcome.create({
      data: {
        ...input,
        signals: input.signals as unknown as object,
      },
    });
  },

  async aggregateByChallenge(challengeId: string) {
    const [counts, adherence] = await Promise.all([
      prisma.outcome.count({ where: { challengeId } }),
      prisma.outcome.aggregate({
        _avg: { adherence: true },
        where: { challengeId },
      }),
    ]);
    return { total: counts, avgAdherence: adherence._avg.adherence ?? 0 };
  },
};
