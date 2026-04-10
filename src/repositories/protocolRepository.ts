import { prisma } from "../db/client";
import { ProtocolStep } from "../types";

export const protocolRepository = {
  async list() {
    return prisma.protocol.findMany();
  },

  async getById(id: string) {
    return prisma.protocol.findUnique({ where: { id } });
  },

  async create(input: {
    title: string;
    version: string;
    category?: string;
    recommendedFor: string[];
    steps: ProtocolStep[];
  }) {
    return prisma.protocol.create({
      data: {
        ...input,
        steps: input.steps as unknown as object,
      },
    });
  },

  async evolveVersion(id: string, newVersion: string, steps: ProtocolStep[]) {
    return prisma.protocol.update({
      where: { id },
      data: { version: newVersion, steps: steps as unknown as object },
    });
  },
};
