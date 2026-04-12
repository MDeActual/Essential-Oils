/**
 * PrismaChallengeRepository.ts — Prisma-backed Challenge Repository
 *
 * Concrete implementation of IChallengeRepository using the Prisma client.
 * Data-access only — challenge engine rule logic, sequencing heuristics, and
 * selection criteria (M-003) are moat-protected and must not appear here.
 */

import { Prisma } from "../../generated/prisma";
import { Challenge, ChallengeType, ChallengeCompletionStatus } from "../../protocol/types";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";
import {
  IChallengeRepository,
  CreateChallengeInput,
  UpdateChallengeInput,
} from "../repositories/challengeRepository";
import { getPrismaClient } from "../client";
import {
  prismaChallengeToDomain,
  domainChallengeTypeToPrisma,
  domainChallengeCompletionStatusToPrisma,
} from "../mappers";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        code: RepositoryErrorCode.Conflict,
        message: "A challenge with the same challengeId already exists.",
        cause: err,
      };
    }
    if (err.code === "P2025") {
      return {
        code: RepositoryErrorCode.NotFound,
        message: "Challenge not found.",
        cause: err,
      };
    }
  }
  return {
    code: RepositoryErrorCode.DatabaseError,
    message: err instanceof Error ? err.message : "An unexpected database error occurred.",
    cause: err,
  };
}

export class PrismaChallengeRepository implements IChallengeRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(challengeId: string): Promise<Challenge | null> {
    try {
      const row = await this.db.challenge.findUnique({ where: { challengeId } });
      return row ? prismaChallengeToDomain(row) : null;
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByProtocolId(
    protocolId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Challenge>> {
    try {
      const where = { protocolId };
      const [rows, total] = await this.db.$transaction([
        this.db.challenge.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { dueDay: "asc" },
        }),
        this.db.challenge.count({ where }),
      ]);
      return { items: rows.map(prismaChallengeToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByType(
    type: ChallengeType,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Challenge>> {
    try {
      const where = { type: domainChallengeTypeToPrisma(type) };
      const [rows, total] = await this.db.$transaction([
        this.db.challenge.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { createdAt: "asc" },
        }),
        this.db.challenge.count({ where }),
      ]);
      return { items: rows.map(prismaChallengeToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByCompletionStatus(
    status: ChallengeCompletionStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Challenge>> {
    try {
      const where = { completionStatus: domainChallengeCompletionStatusToPrisma(status) };
      const [rows, total] = await this.db.$transaction([
        this.db.challenge.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { createdAt: "asc" },
        }),
        this.db.challenge.count({ where }),
      ]);
      return { items: rows.map(prismaChallengeToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async create(input: CreateChallengeInput): Promise<Challenge> {
    try {
      const row = await this.db.challenge.create({
        data: {
          challengeId: input.challengeId,
          protocolId: input.protocolId,
          type: domainChallengeTypeToPrisma(input.type),
          prompt: input.prompt,
          dueDay: input.dueDay,
          completionStatus: domainChallengeCompletionStatusToPrisma(input.completionStatus),
          response: input.response ?? null,
        },
      });
      return prismaChallengeToDomain(row);
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async update(
    challengeId: string,
    input: UpdateChallengeInput
  ): Promise<Challenge | null> {
    try {
      const data: Prisma.ChallengeUpdateInput = {};
      if (input.completionStatus !== undefined) {
        data.completionStatus = domainChallengeCompletionStatusToPrisma(input.completionStatus);
      }
      if ("response" in input) data.response = input.response ?? null;

      const row = await this.db.challenge.update({ where: { challengeId }, data });
      return prismaChallengeToDomain(row);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        return null;
      }
      throw toRepositoryError(err);
    }
  }
}
