/**
 * PrismaOutcomeLogRepository.ts — Prisma-backed OutcomeLog Repository
 *
 * Concrete implementation of IOutcomeLogRepository using the Prisma client.
 * Data-access only — analytics aggregation and signal extraction (M-004)
 * remain in src/analytics/.
 */

import { Prisma } from "../../generated/prisma";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";
import {
  IOutcomeLogRepository,
  OutcomeLog,
  CreateOutcomeLogInput,
} from "../repositories/outcomeLogRepository";
import { getPrismaClient } from "../client";
import { prismaOutcomeLogToDomain } from "../mappers";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        code: RepositoryErrorCode.Conflict,
        message: "An outcome log entry with the same id already exists.",
        cause: err,
      };
    }
    if (err.code === "P2025") {
      return {
        code: RepositoryErrorCode.NotFound,
        message: "Outcome log entry not found.",
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

export class PrismaOutcomeLogRepository implements IOutcomeLogRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<OutcomeLog | null> {
    try {
      const row = await this.db.outcomeLog.findUnique({ where: { id } });
      return row ? prismaOutcomeLogToDomain(row) : null;
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByContributorId(
    contributorId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<OutcomeLog>> {
    try {
      const where = { contributorId };
      const [rows, total] = await this.db.$transaction([
        this.db.outcomeLog.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { loggedAt: "asc" },
        }),
        this.db.outcomeLog.count({ where }),
      ]);
      return { items: rows.map(prismaOutcomeLogToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByProtocolId(
    protocolId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<OutcomeLog>> {
    try {
      const where = { protocolId };
      const [rows, total] = await this.db.$transaction([
        this.db.outcomeLog.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { loggedAt: "asc" },
        }),
        this.db.outcomeLog.count({ where }),
      ]);
      return { items: rows.map(prismaOutcomeLogToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async create(input: CreateOutcomeLogInput): Promise<OutcomeLog> {
    try {
      const row = await this.db.outcomeLog.create({
        data: {
          contributorId: input.contributorId,
          protocolId: input.protocolId,
          notes: input.notes,
          loggedAt: new Date(input.loggedAt),
        },
      });
      return prismaOutcomeLogToDomain(row);
    } catch (err) {
      throw toRepositoryError(err);
    }
  }
}
