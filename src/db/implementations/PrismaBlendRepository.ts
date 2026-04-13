/**
 * PrismaBlendRepository.ts — Prisma-backed Blend Repository
 *
 * Concrete implementation of IBlendRepository using the Prisma client.
 * Data-access only — the synergy scoring algorithm and weight matrix (M-001)
 * are moat-protected and must not appear here.
 *
 * MOAT NOTICE (M-001): Only the pre-computed synergyScore value is stored.
 * The computation method must not be reconstructed here.
 */

import { Prisma } from "../../generated/prisma";
import { Blend, BlendSafetyStatus } from "../../blend/types";
import { ApplicationMethod } from "../../ontology/types";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";
import {
  IBlendRepository,
  CreateBlendInput,
  UpdateBlendInput,
} from "../repositories/blendRepository";
import { getPrismaClient } from "../client";
import {
  prismaBlendToDomain,
  domainApplicationMethodToPrisma,
  domainBlendSafetyStatusToPrisma,
} from "../mappers";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        code: RepositoryErrorCode.Conflict,
        message: "A blend with the same blendId already exists.",
        cause: err,
      };
    }
    if (err.code === "P2025") {
      return {
        code: RepositoryErrorCode.NotFound,
        message: "Blend not found.",
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

export class PrismaBlendRepository implements IBlendRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(blendId: string): Promise<Blend | null> {
    try {
      const row = await this.db.blend.findUnique({ where: { blendId } });
      return row ? prismaBlendToDomain(row) : null;
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByApplicationMethod(
    method: ApplicationMethod,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Blend>> {
    try {
      const where = { applicationMethod: domainApplicationMethodToPrisma(method) };
      const [rows, total] = await this.db.$transaction([
        this.db.blend.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { dbCreatedAt: "asc" },
        }),
        this.db.blend.count({ where }),
      ]);
      return { items: rows.map(prismaBlendToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findBySafetyStatus(
    status: BlendSafetyStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Blend>> {
    try {
      const where = { safetyStatus: domainBlendSafetyStatusToPrisma(status) };
      const [rows, total] = await this.db.$transaction([
        this.db.blend.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { dbCreatedAt: "asc" },
        }),
        this.db.blend.count({ where }),
      ]);
      return { items: rows.map(prismaBlendToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async create(input: CreateBlendInput): Promise<Blend> {
    try {
      const row = await this.db.blend.create({
        data: {
          blendId: input.blendId,
          oils: input.oils as unknown as Prisma.InputJsonValue,
          synergyScore: input.synergyScore,
          applicationMethod: domainApplicationMethodToPrisma(input.applicationMethod),
          intendedEffect: input.intendedEffect,
          safetyStatus: domainBlendSafetyStatusToPrisma(input.safetyStatus),
          createdAt: new Date(input.createdAt),
          lastReviewedAt: new Date(input.lastReviewedAt),
        },
      });
      return prismaBlendToDomain(row);
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async update(blendId: string, input: UpdateBlendInput): Promise<Blend | null> {
    try {
      const data: Prisma.BlendUpdateInput = {};
      if (input.synergyScore !== undefined) data.synergyScore = input.synergyScore;
      if (input.safetyStatus !== undefined) {
        data.safetyStatus = domainBlendSafetyStatusToPrisma(input.safetyStatus);
      }
      if (input.lastReviewedAt !== undefined) {
        data.lastReviewedAt = new Date(input.lastReviewedAt);
      }

      const row = await this.db.blend.update({ where: { blendId }, data });
      return prismaBlendToDomain(row);
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
