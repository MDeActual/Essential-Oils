import { Prisma } from "../../generated/prisma";
import { Protocol, ProtocolStatus } from "../../protocol/types";
import { getPrismaClient } from "../client";
import { domainProtocolStatusToPrisma, prismaProtocolToDomain } from "../mappers";
import { CreateProtocolInput, IProtocolRepository, UpdateProtocolInput } from "../repositories/protocolRepository";
import { LOCAL_DEVELOPMENT_TENANT_ID, validateTenantId } from "../tenant";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return { code: RepositoryErrorCode.Conflict, message: "A protocol with the same protocolId already exists.", cause: err };
    if (err.code === "P2025") return { code: RepositoryErrorCode.NotFound, message: "Protocol not found.", cause: err };
  }
  return { code: RepositoryErrorCode.DatabaseError, message: err instanceof Error ? err.message : "Database operation failed.", cause: err };
}

export class PrismaProtocolRepository implements IProtocolRepository {
  private readonly tenantId: string;

  constructor(tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID) {
    this.tenantId = validateTenantId(tenantId);
  }

  private get db() { return getPrismaClient(); }

  async findById(protocolId: string): Promise<Protocol | null> {
    try {
      const row = await this.db.protocol.findUnique({ where: { tenantId_protocolId: { tenantId: this.tenantId, protocolId } } });
      return row ? prismaProtocolToDomain(row) : null;
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByUserProfileId(userProfileId: string, pagination?: PaginationOptions): Promise<PagedResult<Protocol>> {
    try {
      const where = { tenantId: this.tenantId, userProfileId };
      const [rows, total] = await this.db.$transaction([
        this.db.protocol.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { dbCreatedAt: "asc" } }),
        this.db.protocol.count({ where }),
      ]);
      return { items: rows.map(prismaProtocolToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByStatus(status: ProtocolStatus, pagination?: PaginationOptions): Promise<PagedResult<Protocol>> {
    try {
      const where = { tenantId: this.tenantId, status: domainProtocolStatusToPrisma(status) };
      const [rows, total] = await this.db.$transaction([
        this.db.protocol.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { dbCreatedAt: "asc" } }),
        this.db.protocol.count({ where }),
      ]);
      return { items: rows.map(prismaProtocolToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async create(input: CreateProtocolInput): Promise<Protocol> {
    try {
      const row = await this.db.protocol.create({ data: {
        tenantId: this.tenantId,
        protocolId: input.protocolId,
        version: input.version,
        userProfileId: input.userProfileId,
        goal: input.goal,
        durationDays: input.durationDays,
        status: domainProtocolStatusToPrisma(input.status),
        phases: input.phases as unknown as Prisma.InputJsonValue,
        challengeIds: input.challengeIds,
        createdAt: new Date(input.createdAt),
      } });
      return prismaProtocolToDomain(row);
    } catch (err) { throw toRepositoryError(err); }
  }

  async update(protocolId: string, input: UpdateProtocolInput): Promise<Protocol | null> {
    try {
      const data: Prisma.ProtocolUpdateInput = {};
      if (input.version !== undefined) data.version = input.version;
      if (input.goal !== undefined) data.goal = input.goal;
      if (input.phases !== undefined) data.phases = input.phases as unknown as Prisma.InputJsonValue;
      if (input.durationDays !== undefined) data.durationDays = input.durationDays;
      if (input.challengeIds !== undefined) data.challengeIds = input.challengeIds;
      if (input.status !== undefined) data.status = domainProtocolStatusToPrisma(input.status);
      const row = await this.db.protocol.update({ where: { tenantId_protocolId: { tenantId: this.tenantId, protocolId } }, data });
      return prismaProtocolToDomain(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") return null;
      throw toRepositoryError(err);
    }
  }
}
