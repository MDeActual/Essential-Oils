import { Prisma } from "../../generated/prisma";
import { getPrismaClient } from "../client";
import { prismaOutcomeLogToDomain } from "../mappers";
import { IOutcomeLogRepository, OutcomeLog, CreateOutcomeLogInput } from "../repositories/outcomeLogRepository";
import { LOCAL_DEVELOPMENT_TENANT_ID, validateTenantId } from "../tenant";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return { code: RepositoryErrorCode.Conflict, message: "An outcome log entry with the same id already exists.", cause: err };
    if (err.code === "P2003") return { code: RepositoryErrorCode.ForeignKeyViolation, message: "The referenced contributor does not exist in this tenant.", cause: err };
    if (err.code === "P2025") return { code: RepositoryErrorCode.NotFound, message: "Outcome log entry not found.", cause: err };
  }
  return { code: RepositoryErrorCode.DatabaseError, message: err instanceof Error ? err.message : "Database operation failed.", cause: err };
}

export class PrismaOutcomeLogRepository implements IOutcomeLogRepository {
  private readonly tenantId: string;

  constructor(tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID) {
    this.tenantId = validateTenantId(tenantId);
  }

  private get db() { return getPrismaClient(); }

  async findById(id: string): Promise<OutcomeLog | null> {
    try {
      const rows = await this.db.outcomeLog.findMany({
        where: { id, tenantId: this.tenantId },
        take: 1,
      });
      const row = rows[0];
      return row ? prismaOutcomeLogToDomain(row) : null;
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByContributorId(contributorId: string, pagination?: PaginationOptions): Promise<PagedResult<OutcomeLog>> {
    try {
      const where = { tenantId: this.tenantId, contributorId };
      const [rows, total] = await this.db.$transaction([
        this.db.outcomeLog.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { loggedAt: "asc" } }),
        this.db.outcomeLog.count({ where }),
      ]);
      return { items: rows.map(prismaOutcomeLogToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByProtocolId(protocolId: string, pagination?: PaginationOptions): Promise<PagedResult<OutcomeLog>> {
    try {
      const where = { tenantId: this.tenantId, protocolId };
      const [rows, total] = await this.db.$transaction([
        this.db.outcomeLog.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { loggedAt: "asc" } }),
        this.db.outcomeLog.count({ where }),
      ]);
      return { items: rows.map(prismaOutcomeLogToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async create(input: CreateOutcomeLogInput): Promise<OutcomeLog> {
    try {
      const row = await this.db.outcomeLog.create({ data: {
        tenantId: this.tenantId,
        contributorId: input.contributorId,
        protocolId: input.protocolId,
        notes: input.notes,
        loggedAt: new Date(input.loggedAt),
      } });
      return prismaOutcomeLogToDomain(row);
    } catch (err) { throw toRepositoryError(err); }
  }
}
