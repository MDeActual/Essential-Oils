import { prisma } from "../db/client";
import { Role } from "../types";

export const userRepository = {
  async getByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { contributor: true } });
  },
  async getById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { contributor: true } });
  },
  async create(input: { email: string; passwordHash: string; role: Role; contributorId?: string }) {
    return prisma.user.create({ data: input });
  },
};
