import { Prisma } from "../../generated/prisma";
import { Challenge, ChallengeType, ChallengeCompletionStatus } from "../../protocol/types";
import { getPrismaClient } from "../client";
import { prismaChallengeToDomain, domainChallengeTypeToPrisma, domainChallengeCompletionStatusToPrisma } from "../mappers";
import { IChallengeRepository, CreateChallengeInput, UpdateChallengeInput } from "../repositories/challengeRepository";
import { LOCAL_DEVELOPMENT_TENANT_ID, validateTenantId } from "../tenant";
import { PaginationOptions, PagedResult, RepositoryError, RepositoryErrorCode } from "../types";

function toRepositoryError(err: unknown): RepositoryError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return { code: RepositoryErrorCode.Conflict, message: "A challenge with the same challengeId already exists.", cause: err };
    if (err.code === "P2003") return { code: RepositoryErrorCode.ForeignKeyViolation, message: "The referenced protocol does not exist in this tenant.", cause: err };
    if (err.code === "P2025") return { code: RepositoryErrorCode.NotFound, message: "Challenge not found.", cause: err };
  }
  return { code: RepositoryErrorCode.DatabaseError, message: err instanceof Error ? err.message : "Database operation failed.", cause: err };
}

export class PrismaChallengeRepository implements IChallengeRepository {
  private readonly tenantId: string;

  constructor(tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID) {
    this.tenantId = validateTenantId(tenantId);
  }

  private get db() { return getPrismaClient(); }

  async findById(challengeId: string): Promise<Challenge | null> {
    try {
      const row = await this.db.challenge.findUnique({ where: { tenantId_challengeId: { tenantId: this.tenantId, challengeId } } });
      return row ? prismaChallengeToDomain(row) : null;
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByProtocolId(protocolId: string, pagination?: PaginationOptions): Promise<PagedResult<Challenge>> {
    try {
      const where = { tenantId: this.tenantId, protocolId };
      const [rows, total] = await this.db.$transaction([
        this.db.challenge.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { dueDay: "asc" } }),
        this.db.challenge.count({ where }),
      ]);
      return { items: rows.map(prismaChallengeToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByType(type: ChallengeType, pagination?: PaginationOptions): Promise<PagedResult<Challenge>> {
    try {
      const where = { tenantId: this.tenantId, type: domainChallengeTypeToPrisma(type) };
      const [rows, total] = await this.db.$transaction([
        this.db.challenge.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { createdAt: "asc" } }),
        this.db.challenge.count({ where }),
      ]);
      return { items: rows.map(prismaChallengeToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async findByCompletionStatus(status: ChallengeCompletionStatus, pagination?: PaginationOptions): Promise<PagedResult<Challenge>> {
    try {
      const where = { tenantId: this.tenantId, completionStatus: domainChallengeCompletionStatusToPrisma(status) };
      const [rows, total] = await this.db.$transaction([
        this.db.challenge.findMany({ where, skip: pagination?.offset, take: pagination?.limit, orderBy: { createdAt: "asc" } }),
        this.db.challenge.count({ where }),
      ]);
      return { items: rows.map(prismaChallengeToDomain), total };
    } catch (err) { throw toRepositoryError(err); }
  }

  async create(input: CreateChallengeInput): Promise<Challenge> {
    try {
      const row = await this.db.challenge.create({ data: {
        tenantId: this.tenantId,
        challengeId: input.challengeId,
        protocolId: input.protocolId,
        type: domainChallengeTypeToPrisma(input.type),
        prompt: input.prompt,
        dueDay: input.dueDay,
        completionStatus: domainChallengeCompletionStatusToPrisma(input.completionStatus),
        response: input.response ?? null,
      } });
      return prismaChallengeToDomain(row);
    } catch (err) { throw toRepositoryError(err); }
  }

  async update(challengeId: string, input: UpdateChallengeInput): Promise<Challenge | null> {
    try {
      const data: Prisma.ChallengeUpdateInput = {};
      if (input.completionStatus !== undefined) data.completionStatus = domainChallengeCompletionStatusToPrisma(input.completionStatus);
      if ("response" in input) data.response = input.response ?? null;
      const row = await this.db.challenge.update({ where: { tenantId_challengeId: { tenantId: this.tenantId, challengeId } }, data });
      return prismaChallengeToDomain(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") return null;
      throw toRepositoryError(err);
    }
  }
}
