import { prisma } from "../db/client";
import { DataOrigin } from "../types";

export const contributorRepository = {
  async list() {
    return prisma.contributor.findMany();
  },

  async getById(id: string) {
    return prisma.contributor.findUnique({ where: { id } });
  },

  async create(input: { name: string; region?: string; dataOrigin: DataOrigin; reputationScore?: number }) {
    return prisma.contributor.create({ data: input });
  },
};
