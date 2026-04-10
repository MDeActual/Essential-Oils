import { prisma } from "../db/client";

export const challengeRepository = {
  async list() {
    return prisma.challenge.findMany({ include: { protocol: true } });
  },

  async getById(id: string) {
    return prisma.challenge.findUnique({ where: { id }, include: { protocol: true } });
  },

  async addParticipant(challengeId: string, contributorId: string) {
    return prisma.challengeParticipant.create({
      data: { challengeId, contributorId },
    });
  },
};
