/**
 * index.ts — Persistence Layer Public Interface
 *
 * Exports all public types and interfaces for the Phyto.ai persistence layer.
 * Consumers of src/db/ must import exclusively through this module.
 *
 * What this module provides:
 *   - Shared persistence types (pagination, errors)
 *   - Repository interfaces for all five persistence models
 *   - Prisma-backed concrete repository implementations
 * What this module does NOT provide:
 *   - Direct Prisma client access (use src/db/client.ts for that)
 *
 * MOAT NOTICE: No proprietary algorithm outputs, weight matrices, or scoring
 *   logic are exposed through this module (LOCK-002, M-001, M-002, M-003, M-004).
 */

// ---------------------------------------------------------------------------
// Shared persistence types
// ---------------------------------------------------------------------------
export type { PaginationOptions, PagedResult, RepositoryError } from "./types";
export { RepositoryErrorCode } from "./types";

// ---------------------------------------------------------------------------
// Repository interfaces
// ---------------------------------------------------------------------------
export type { IContributorRepository, CreateContributorInput, UpdateContributorInput } from "./repositories/contributorRepository";
export type { IProtocolRepository, CreateProtocolInput, UpdateProtocolInput } from "./repositories/protocolRepository";
export type { IChallengeRepository, CreateChallengeInput, UpdateChallengeInput } from "./repositories/challengeRepository";
export type { IBlendRepository, CreateBlendInput, UpdateBlendInput } from "./repositories/blendRepository";
export type {
  IOutcomeLogRepository,
  OutcomeLog,
  CreateOutcomeLogInput,
} from "./repositories/outcomeLogRepository";

// ---------------------------------------------------------------------------
// Concrete Prisma-backed repository implementations
// ---------------------------------------------------------------------------
export { PrismaContributorRepository } from "./implementations/PrismaContributorRepository";
export { PrismaProtocolRepository } from "./implementations/PrismaProtocolRepository";
export { PrismaChallengeRepository } from "./implementations/PrismaChallengeRepository";
export { PrismaBlendRepository } from "./implementations/PrismaBlendRepository";
export { PrismaOutcomeLogRepository } from "./implementations/PrismaOutcomeLogRepository";
