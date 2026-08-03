import { Prisma } from "../../generated/prisma";
import { ContributorRecord, DataOrigin, ExclusionStatus } from "../../analytics/types";
import { getPrismaClient } from "../client";
import { domainDataOriginToPrisma, domainExclusionReasonToPrisma, domainExclusionStatusToPrisma, prismaContributorToDomain } from "../mappers";
import { CreateContributorInput, IContributorRepository, UpdateContributorInput } from "../repositories/contributorRepository";
import { LOCAL_DEVELOPMENT_TENANT_ID, validateTenantId } from "../tenant";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return { code: RepositoryErrorCode.Conflict, message: "A contributor record with the same recordId already exists.", cause: err };
    if (err.code === "P2025") return { code: RepositoryErrorCode.NotFound, message: "Contributor record not found.", cause: err };
  }
  return { code: RepositoryErrorCode.DatabaseError, message: err instanceof Error ? err.message : "Database operation failed.", cause: err };
}

export class PrismaContributorRepository implements IContributorRepository {
  private readonly tenantId: string;

  constructor(tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID) {
    this.tenantId = validateTenantId(tenantId);
  }

  private get db() { return getPrismaClient(); }

  async findById(recordId: string): Promise<ContributorRecord | null> {
    try {
      const row = await this.db.contributor.findUnique({ where: { tenantId_recordId: { tenantId: this.tenantId, recordId } } });
      return row ? prismaContributorToDomain(row) : null;
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByProtocolId(protocolId: string, pagination?: PaginationOptions): Promise<PagedResult<ContributorRecord>> {
    try {
      const where = { tenantId: this.tenantId, protocolId };
      const [rows, total] = await this.db.$transaction([
        this.db.contributor.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { createdAt: "asc" } }),
        this.db.contributor.count({ where }),
      ]);
      return { items: rows.map(prismaContributorToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByDataOrigin(origin: DataOrigin, pagination?: PaginationOptions): Promise<PagedResult<ContributorRecord>> {
    try {
      const where = { tenantId: this.tenantId, dataOrigin: domainDataOriginToPrisma(origin) };
      const [rows, total] = await this.db.$transaction([
        this.db.contributor.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { createdAt: "asc" } }),
        this.db.contributor.count({ where }),
      ]);
      return { items: rows.map(prismaContributorToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByExclusionStatus(status: ExclusionStatus, pagination?: PaginationOptions): Promise<PagedResult<ContributorRecord>> {
    try {
      const where = { tenantId: this.tenantId, exclusionStatus: domainExclusionStatusToPrisma(status) };
      const [rows, total] = await this.db.$transaction([
        this.db.contributor.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { createdAt: "asc" } }),
        this.db.contributor.count({ where }),
      ]);
      return { items: rows.map(prismaContributorToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async create(input: CreateContributorInput): Promise<ContributorRecord> {
    try {
      const row = await this.db.contributor.create({ data: {
        tenantId: this.tenantId,
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
      } });
      return prismaContributorToDomain(row);
    } catch (err) { throw toRepositoryError(err); }
  }

  async update(recordId: string, input: UpdateContributorInput): Promise<ContributorRecord | null> {
    try {
      const data: Prisma.ContributorUpdateInput = {};
      if (input.exclusionStatus !== undefined) data.exclusionStatus = domainExclusionStatusToPrisma(input.exclusionStatus);
      if ("exclusionReason" in input) data.exclusionReason = domainExclusionReasonToPrisma(input.exclusionReason);
      if (input.adherenceScore !== undefined) data.adherenceScore = input.adherenceScore;
      if (input.challengeCompletionRate !== undefined) data.challengeCompletionRate = input.challengeCompletionRate;
      if ("outcomeNotes" in input) data.outcomeNotes = input.outcomeNotes ?? null;
      const row = await this.db.contributor.update({ where: { tenantId_recordId: { tenantId: this.tenantId, recordId } }, data });
      return prismaContributorToDomain(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") return null;
      throw toRepositoryError(err);
    }
  }
}
