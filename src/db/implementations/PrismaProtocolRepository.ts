/**
 * PrismaProtocolRepository.ts — Prisma-backed Protocol Repository
 *
 * Concrete implementation of IProtocolRepository using the Prisma client.
 * Data-access only — the protocol generation algorithm (M-002) and version
 * validation (LOCK-005) are enforced by the application layer, not here.
 */

import { Prisma } from "../../generated/prisma";
import { Protocol, ProtocolStatus } from "../../protocol/types";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";
import {
  IProtocolRepository,
  CreateProtocolInput,
  UpdateProtocolInput,
} from "../repositories/protocolRepository";
import { getPrismaClient } from "../client";
import {
  prismaProtocolToDomain,
  domainProtocolStatusToPrisma,
} from "../mappers";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return {
        code: RepositoryErrorCode.Conflict,
        message: "A protocol with the same protocolId already exists.",
        cause: err,
      };
    }
    if (err.code === "P2025") {
      return {
        code: RepositoryErrorCode.NotFound,
        message: "Protocol not found.",
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

export class PrismaProtocolRepository implements IProtocolRepository {
  private get db() {
    return getPrismaClient();
  }

  async findById(protocolId: string): Promise<Protocol | null> {
    try {
      const row = await this.db.protocol.findUnique({ where: { protocolId } });
      return row ? prismaProtocolToDomain(row) : null;
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByUserProfileId(
    userProfileId: string,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Protocol>> {
    try {
      const where = { userProfileId };
      const [rows, total] = await this.db.$transaction([
        this.db.protocol.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { dbCreatedAt: "asc" },
        }),
        this.db.protocol.count({ where }),
      ]);
      return { items: rows.map(prismaProtocolToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async findByStatus(
    status: ProtocolStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Protocol>> {
    try {
      const where = { status: domainProtocolStatusToPrisma(status) };
      const [rows, total] = await this.db.$transaction([
        this.db.protocol.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { dbCreatedAt: "asc" },
        }),
        this.db.protocol.count({ where }),
      ]);
      return { items: rows.map(prismaProtocolToDomain), total };
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async create(input: CreateProtocolInput): Promise<Protocol> {
    try {
      const row = await this.db.protocol.create({
        data: {
          protocolId: input.protocolId,
          version: input.version,
          userProfileId: input.userProfileId,
          goal: input.goal,
          durationDays: input.durationDays,
          status: domainProtocolStatusToPrisma(input.status),
          phases: input.phases as unknown as Prisma.InputJsonValue,
          challengeIds: input.challengeIds,
          createdAt: new Date(input.createdAt),
        },
      });
      return prismaProtocolToDomain(row);
    } catch (err) {
      throw toRepositoryError(err);
    }
  }

  async update(
    protocolId: string,
    input: UpdateProtocolInput
  ): Promise<Protocol | null> {
    try {
      const data: Prisma.ProtocolUpdateInput = {};
      if (input.version !== undefined) data.version = input.version;
      if (input.goal !== undefined) data.goal = input.goal;
      if (input.phases !== undefined) data.phases = input.phases as unknown as Prisma.InputJsonValue;
      if (input.durationDays !== undefined) data.durationDays = input.durationDays;
      if (input.challengeIds !== undefined) data.challengeIds = input.challengeIds;
      if (input.status !== undefined) data.status = domainProtocolStatusToPrisma(input.status);

      const row = await this.db.protocol.update({ where: { protocolId }, data });
      return prismaProtocolToDomain(row);
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
