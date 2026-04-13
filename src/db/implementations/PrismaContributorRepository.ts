/**
 * PrismaContributorRepository.ts — Prisma-backed Contributor Repository
 *
 * Concrete implementation of IContributorRepository using the Prisma client.
 * All data-access logic is contained here; no business logic is permitted
 * (validation, exclusion thresholds, and analytics rules live in src/analytics/).
 *
 * LOCK-003: dataOrigin and exclusionStatus are required fields enforced by the
 * Prisma schema. This layer does not re-validate them beyond what Prisma enforces.
 */

import { Prisma } from "../../generated/prisma";
import { ContributorRecord, DataOrigin, ExclusionStatus } from "../../analytics/types";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";
import {
  IContributorRepository,
  CreateContributorInput,
  UpdateContributorInput,
} from "../repositories/contributorRepository";
import { getPrismaClient } from "../client";
import {
  prismaContributorToDomain,
  domainDataOriginToPrisma,
  domainExclusionStatusToPrisma,
  domainExclusionReasonToPrisma,
} from "../mappers";

/** Wraps an unknown error into a structured RepositoryError. */
function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        code: RepositoryErrorCode.Conflict,
        message: "A contributor record with the same recordId already exists.",
        cause: err,
      };
    }
    if (err.code === "P2025") {
      return {
        code: RepositoryErrorCode.NotFound,
        message: "Contributor record not found.",
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

export class PrismaContributorRepository implements IContributorRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(recordId: string): Promise<ContributorRecord | null> {
    try {
      const row = await this.db.contributor.findUnique({ where: { recordId } });
      return row ? prismaContributorToDomain(row) : null;
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByProtocolId(
    protocolId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<ContributorRecord>> {
    try {
      const where = { protocolId };
      const [rows, total] = await this.db.$transaction([
        this.db.contributor.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { createdAt: "asc" },
        }),
        this.db.contributor.count({ where }),
      ]);
      return { items: rows.map(prismaContributorToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByDataOrigin(
    origin: DataOrigin,
    pagination?: PaginationOptions
  ): Promise<PagedResult<ContributorRecord>> {
    try {
      const where = { dataOrigin: domainDataOriginToPrisma(origin) };
      const [rows, total] = await this.db.$transaction([
        this.db.contributor.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { createdAt: "asc" },
        }),
        this.db.contributor.count({ where }),
      ]);
      return { items: rows.map(prismaContributorToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByExclusionStatus(
    status: ExclusionStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<ContributorRecord>> {
    try {
      const where = { exclusionStatus: domainExclusionStatusToPrisma(status) };
      const [rows, total] = await this.db.$transaction([
        this.db.contributor.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { createdAt: "asc" },
        }),
        this.db.contributor.count({ where }),
      ]);
      return { items: rows.map(prismaContributorToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async create(input: CreateContributorInput): Promise<ContributorRecord> {
    try {
      const row = await this.db.contributor.create({
        data: {
          recordId: input.recordId,
          userId: input.userId,
          protocolId: input.protocolId,
          dataOrigin: domainDataOriginToPrisma(input.dataOrigin),
          exclusionStatus: domainExclusionStatusToPrisma(input.exclusionStatus),
          exclusionReason: domainExclusionReasonToPrisma(input.exclusionReason),
          adherenceScore: input.adherenceScore,
          challengeCompletionRate: input.challengeCompletionRate,
          outcomeNotes: input.outcomeNotes ?? null,
          recordedAt: new Date(input.recordedAt),
        },
      });
      return prismaContributorToDomain(row);
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async update(
    recordId: string,
    input: UpdateContributorInput
  ): Promise<ContributorRecord | null> {
    try {
      const data: Prisma.ContributorUpdateInput = {};
      if (input.exclusionStatus !== undefined) {
        data.exclusionStatus = domainExclusionStatusToPrisma(input.exclusionStatus);
      }
      if ("exclusionReason" in input) {
        data.exclusionReason = domainExclusionReasonToPrisma(input.exclusionReason);
      }
      if (input.adherenceScore !== undefined) data.adherenceScore = input.adherenceScore;
      if (input.challengeCompletionRate !== undefined) {
        data.challengeCompletionRate = input.challengeCompletionRate;
      }
      if ("outcomeNotes" in input) data.outcomeNotes = input.outcomeNotes ?? null;

      const row = await this.db.contributor.update({ where: { recordId }, data });
      return prismaContributorToDomain(row);
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
