/**
 * repositories.test.ts — Unit tests for Prisma-backed repository implementations
 *
 * Uses Jest module mocking to stub the Prisma client, allowing all repository
 * logic to be tested without a live database connection.
 *
 * Coverage:
 *  - PrismaContributorRepository
 *  - PrismaProtocolRepository
 *  - PrismaChallengeRepository
 *  - PrismaBlendRepository
 *  - PrismaOutcomeLogRepository
 */

// ---------------------------------------------------------------------------
// Mock the generated Prisma client before any imports that use it.
// ---------------------------------------------------------------------------

const mockContributor = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockProtocol = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockChallenge = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockBlend = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockOutcomeLog = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
};
const mockTransaction = jest.fn();

const mockPrismaInstance = {
  contributor: mockContributor,
  protocol: mockProtocol,
  challenge: mockChallenge,
  blend: mockBlend,
  outcomeLog: mockOutcomeLog,
  $transaction: mockTransaction,
};

jest.mock("../client", () => ({
  getPrismaClient: () => mockPrismaInstance,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are set up)
// ---------------------------------------------------------------------------

import { PrismaContributorRepository } from "../implementations/PrismaContributorRepository";
import { PrismaProtocolRepository } from "../implementations/PrismaProtocolRepository";
import { PrismaChallengeRepository } from "../implementations/PrismaChallengeRepository";
import { PrismaBlendRepository } from "../implementations/PrismaBlendRepository";
import { PrismaOutcomeLogRepository } from "../implementations/PrismaOutcomeLogRepository";

import { DataOrigin, ExclusionStatus, ExclusionReason } from "../../analytics/types";
import { ProtocolStatus, ChallengeType, ChallengeCompletionStatus } from "../../protocol/types";
import { BlendSafetyStatus, BlendRole } from "../../blend/types";
import { ApplicationMethod } from "../../ontology/types";
import { RepositoryErrorCode } from "../types";
import { $Enums } from "../../generated/prisma";

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const NOW = new Date("2026-01-01T00:00:00.000Z");
const NOW_ISO = NOW.toISOString();

const prismaContributorRow = {
  id: "db-id-1",
  recordId: "rec-001",
  userId: "user-001",
  protocolId: "proto-001",
  dataOrigin: $Enums.DataOrigin.REAL_CONTRIBUTOR,
  exclusionStatus: $Enums.ExclusionStatus.INCLUDED,
  exclusionReason: null,
  adherenceScore: 80,
  challengeCompletionRate: 75,
  outcomeNotes: "Feeling better",
  recordedAt: NOW,
  createdAt: NOW,
  updatedAt: NOW,
};

const prismaProtocolRow = {
  id: "db-id-2",
  protocolId: "proto-001",
  version: "1.0.0",
  userProfileId: "user-001",
  goal: "Improve sleep",
  durationDays: 30,
  status: $Enums.ProtocolStatus.DRAFT,
  phases: [{ phaseIndex: 0, label: "Init", durationDays: 30, blendIds: [], oilIds: [], instructions: "Start" }],
  challengeIds: ["ch-001"],
  createdAt: NOW,
  dbCreatedAt: NOW,
  updatedAt: NOW,
};

const prismaChallengeRow = {
  id: "db-id-3",
  challengeId: "ch-001",
  protocolId: "proto-001",
  type: $Enums.ChallengeType.ADHERENCE,
  prompt: "Apply blend daily",
  dueDay: 1,
  completionStatus: $Enums.ChallengeCompletionStatus.PENDING,
  response: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const prismaBlendRow = {
  id: "db-id-4",
  blendId: "blend-001",
  oils: [{ oilId: "lavender", ratio: 2, role: "primary" }],
  synergyScore: 85,
  applicationMethod: $Enums.ApplicationMethod.TOPICAL,
  intendedEffect: "Calming",
  safetyStatus: $Enums.BlendSafetyStatus.VALIDATED,
  createdAt: NOW,
  lastReviewedAt: NOW,
  dbCreatedAt: NOW,
  updatedAt: NOW,
};

const prismaOutcomeLogRow = {
  id: "log-001",
  contributorId: "rec-001",
  protocolId: "proto-001",
  notes: "Good progress",
  loggedAt: NOW,
  createdAt: NOW,
};

// ---------------------------------------------------------------------------
// PrismaContributorRepository
// ---------------------------------------------------------------------------

describe("PrismaContributorRepository", () => {
  let repo: PrismaContributorRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaContributorRepository();
  });

  describe("findById", () => {
    it("returns a mapped domain record when found", async () => {
      mockContributor.findUnique.mockResolvedValue(prismaContributorRow);
      const result = await repo.findById("rec-001");
      expect(result).not.toBeNull();
      expect(result?.recordId).toBe("rec-001");
      expect(result?.dataOrigin).toBe(DataOrigin.RealContributor);
      expect(result?.exclusionStatus).toBe(ExclusionStatus.Included);
      expect(result?.adherenceScore).toBe(80);
      expect(result?.recordedAt).toBe(NOW_ISO);
    });

    it("returns null when record does not exist", async () => {
      mockContributor.findUnique.mockResolvedValue(null);
      const result = await repo.findById("missing");
      expect(result).toBeNull();
    });
  });

  describe("findByProtocolId", () => {
    it("returns paged results", async () => {
      mockTransaction.mockResolvedValue([[prismaContributorRow], 1]);
      const result = await repo.findByProtocolId("proto-001", { limit: 10, offset: 0 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].protocolId).toBe("proto-001");
    });
  });

  describe("findByDataOrigin", () => {
    it("filters by real_contributor origin", async () => {
      mockTransaction.mockResolvedValue([[prismaContributorRow], 1]);
      const result = await repo.findByDataOrigin(DataOrigin.RealContributor);
      expect(result.total).toBe(1);
    });
  });

  describe("findByExclusionStatus", () => {
    it("filters by included status", async () => {
      mockTransaction.mockResolvedValue([[prismaContributorRow], 1]);
      const result = await repo.findByExclusionStatus(ExclusionStatus.Included);
      expect(result.items[0].exclusionStatus).toBe(ExclusionStatus.Included);
    });
  });

  describe("create", () => {
    it("creates and returns a mapped domain record", async () => {
      mockContributor.create.mockResolvedValue(prismaContributorRow);
      const input = {
        recordId: "rec-001",
        userId: "user-001",
        protocolId: "proto-001",
        dataOrigin: DataOrigin.RealContributor,
        exclusionStatus: ExclusionStatus.Included,
        adherenceScore: 80,
        challengeCompletionRate: 75,
        outcomeNotes: "Feeling better",
        recordedAt: NOW_ISO,
      };
      const result = await repo.create(input);
      expect(result.recordId).toBe("rec-001");
      expect(mockContributor.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("updates and returns the updated domain record", async () => {
      const updatedRow = {
        ...prismaContributorRow,
        exclusionStatus: $Enums.ExclusionStatus.EXCLUDED,
        exclusionReason: $Enums.ExclusionReason.ADHERENCE_BELOW_THRESHOLD,
        adherenceScore: 40,
      };
      mockContributor.update.mockResolvedValue(updatedRow);
      const result = await repo.update("rec-001", {
        exclusionStatus: ExclusionStatus.Excluded,
        exclusionReason: ExclusionReason.AdherenceBelowThreshold,
        adherenceScore: 40,
      });
      expect(result?.exclusionStatus).toBe(ExclusionStatus.Excluded);
      expect(result?.adherenceScore).toBe(40);
    });

    it("returns null when record does not exist (P2025)", async () => {
      const err = Object.assign(new Error("not found"), {
        code: "P2025",
        name: "PrismaClientKnownRequestError",
      });
      // Simulate PrismaClientKnownRequestError
      Object.setPrototypeOf(err, require("../../generated/prisma").Prisma.PrismaClientKnownRequestError.prototype);
      mockContributor.update.mockRejectedValue(err);
      const result = await repo.update("missing", { adherenceScore: 50 });
      expect(result).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// PrismaProtocolRepository
// ---------------------------------------------------------------------------

describe("PrismaProtocolRepository", () => {
  let repo: PrismaProtocolRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaProtocolRepository();
  });

  describe("findById", () => {
    it("returns mapped protocol when found", async () => {
      mockProtocol.findUnique.mockResolvedValue(prismaProtocolRow);
      const result = await repo.findById("proto-001");
      expect(result?.protocolId).toBe("proto-001");
      expect(result?.status).toBe(ProtocolStatus.Draft);
      expect(result?.createdAt).toBe(NOW_ISO);
    });

    it("returns null when not found", async () => {
      mockProtocol.findUnique.mockResolvedValue(null);
      expect(await repo.findById("x")).toBeNull();
    });
  });

  describe("findByUserProfileId", () => {
    it("returns paged results", async () => {
      mockTransaction.mockResolvedValue([[prismaProtocolRow], 1]);
      const result = await repo.findByUserProfileId("user-001");
      expect(result.total).toBe(1);
      expect(result.items[0].userProfileId).toBe("user-001");
    });
  });

  describe("findByStatus", () => {
    it("filters by status", async () => {
      mockTransaction.mockResolvedValue([[prismaProtocolRow], 1]);
      const result = await repo.findByStatus(ProtocolStatus.Draft);
      expect(result.items[0].status).toBe(ProtocolStatus.Draft);
    });
  });

  describe("create", () => {
    it("creates and returns a mapped protocol", async () => {
      mockProtocol.create.mockResolvedValue(prismaProtocolRow);
      const result = await repo.create({
        protocolId: "proto-001",
        version: "1.0.0",
        userProfileId: "user-001",
        goal: "Improve sleep",
        durationDays: 30,
        status: ProtocolStatus.Draft,
        phases: [],
        challengeIds: [],
        createdAt: NOW_ISO,
      });
      expect(result.protocolId).toBe("proto-001");
    });
  });

  describe("update", () => {
    it("updates mutable fields", async () => {
      const updatedRow = { ...prismaProtocolRow, status: $Enums.ProtocolStatus.ACTIVE };
      mockProtocol.update.mockResolvedValue(updatedRow);
      const result = await repo.update("proto-001", { status: ProtocolStatus.Active });
      expect(result?.status).toBe(ProtocolStatus.Active);
    });
  });
});

// ---------------------------------------------------------------------------
// PrismaChallengeRepository
// ---------------------------------------------------------------------------

describe("PrismaChallengeRepository", () => {
  let repo: PrismaChallengeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaChallengeRepository();
  });

  describe("findById", () => {
    it("returns mapped challenge when found", async () => {
      mockChallenge.findUnique.mockResolvedValue(prismaChallengeRow);
      const result = await repo.findById("ch-001");
      expect(result?.challengeId).toBe("ch-001");
      expect(result?.type).toBe(ChallengeType.Adherence);
      expect(result?.completionStatus).toBe(ChallengeCompletionStatus.Pending);
      expect(result?.response).toBeUndefined();
    });

    it("returns null when not found", async () => {
      mockChallenge.findUnique.mockResolvedValue(null);
      expect(await repo.findById("x")).toBeNull();
    });
  });

  describe("findByProtocolId", () => {
    it("returns paged results ordered by dueDay", async () => {
      mockTransaction.mockResolvedValue([[prismaChallengeRow], 1]);
      const result = await repo.findByProtocolId("proto-001");
      expect(result.total).toBe(1);
    });
  });

  describe("findByType", () => {
    it("filters by challenge type", async () => {
      mockTransaction.mockResolvedValue([[prismaChallengeRow], 1]);
      const result = await repo.findByType(ChallengeType.Adherence);
      expect(result.items[0].type).toBe(ChallengeType.Adherence);
    });
  });

  describe("findByCompletionStatus", () => {
    it("filters by completion status", async () => {
      mockTransaction.mockResolvedValue([[prismaChallengeRow], 1]);
      const result = await repo.findByCompletionStatus(ChallengeCompletionStatus.Pending);
      expect(result.items[0].completionStatus).toBe(ChallengeCompletionStatus.Pending);
    });
  });

  describe("create", () => {
    it("creates and returns a mapped challenge", async () => {
      mockChallenge.create.mockResolvedValue(prismaChallengeRow);
      const result = await repo.create({
        challengeId: "ch-001",
        protocolId: "proto-001",
        type: ChallengeType.Adherence,
        prompt: "Apply blend daily",
        dueDay: 1,
        completionStatus: ChallengeCompletionStatus.Pending,
      });
      expect(result.challengeId).toBe("ch-001");
    });
  });

  describe("update", () => {
    it("updates completion status and response", async () => {
      const updatedRow = {
        ...prismaChallengeRow,
        completionStatus: $Enums.ChallengeCompletionStatus.COMPLETED,
        response: "Done",
      };
      mockChallenge.update.mockResolvedValue(updatedRow);
      const result = await repo.update("ch-001", {
        completionStatus: ChallengeCompletionStatus.Completed,
        response: "Done",
      });
      expect(result?.completionStatus).toBe(ChallengeCompletionStatus.Completed);
      expect(result?.response).toBe("Done");
    });
  });
});

// ---------------------------------------------------------------------------
// PrismaBlendRepository
// ---------------------------------------------------------------------------

describe("PrismaBlendRepository", () => {
  let repo: PrismaBlendRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaBlendRepository();
  });

  describe("findById", () => {
    it("returns mapped blend when found", async () => {
      mockBlend.findUnique.mockResolvedValue(prismaBlendRow);
      const result = await repo.findById("blend-001");
      expect(result?.blendId).toBe("blend-001");
      expect(result?.safetyStatus).toBe(BlendSafetyStatus.Validated);
      expect(result?.applicationMethod).toBe(ApplicationMethod.Topical);
      expect(result?.createdAt).toBe(NOW_ISO);
    });

    it("returns null when not found", async () => {
      mockBlend.findUnique.mockResolvedValue(null);
      expect(await repo.findById("x")).toBeNull();
    });
  });

  describe("findByApplicationMethod", () => {
    it("returns paged results", async () => {
      mockTransaction.mockResolvedValue([[prismaBlendRow], 1]);
      const result = await repo.findByApplicationMethod(ApplicationMethod.Topical);
      expect(result.total).toBe(1);
    });
  });

  describe("findBySafetyStatus", () => {
    it("filters by safety status", async () => {
      mockTransaction.mockResolvedValue([[prismaBlendRow], 1]);
      const result = await repo.findBySafetyStatus(BlendSafetyStatus.Validated);
      expect(result.items[0].safetyStatus).toBe(BlendSafetyStatus.Validated);
    });
  });

  describe("create", () => {
    it("creates and returns a mapped blend", async () => {
      mockBlend.create.mockResolvedValue(prismaBlendRow);
      const result = await repo.create({
        blendId: "blend-001",
        oils: [{ oilId: "lavandula_angustifolia", ratio: 2, role: BlendRole.Primary }],
        synergyScore: 85,
        applicationMethod: ApplicationMethod.Topical,
        intendedEffect: "Calming",
        safetyStatus: BlendSafetyStatus.Validated,
        createdAt: NOW_ISO,
        lastReviewedAt: NOW_ISO,
      });
      expect(result.blendId).toBe("blend-001");
      expect(result.synergyScore).toBe(85);
    });
  });

  describe("update", () => {
    it("updates mutable fields", async () => {
      const updatedRow = { ...prismaBlendRow, safetyStatus: $Enums.BlendSafetyStatus.REJECTED };
      mockBlend.update.mockResolvedValue(updatedRow);
      const result = await repo.update("blend-001", { safetyStatus: BlendSafetyStatus.Rejected });
      expect(result?.safetyStatus).toBe(BlendSafetyStatus.Rejected);
    });
  });
});

// ---------------------------------------------------------------------------
// PrismaOutcomeLogRepository
// ---------------------------------------------------------------------------

describe("PrismaOutcomeLogRepository", () => {
  let repo: PrismaOutcomeLogRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PrismaOutcomeLogRepository();
  });

  describe("findById", () => {
    it("returns mapped outcome log when found", async () => {
      mockOutcomeLog.findUnique.mockResolvedValue(prismaOutcomeLogRow);
      const result = await repo.findById("log-001");
      expect(result?.id).toBe("log-001");
      expect(result?.contributorId).toBe("rec-001");
      expect(result?.loggedAt).toBe(NOW_ISO);
      expect(result?.createdAt).toBe(NOW_ISO);
    });

    it("returns null when not found", async () => {
      mockOutcomeLog.findUnique.mockResolvedValue(null);
      expect(await repo.findById("x")).toBeNull();
    });
  });

  describe("findByContributorId", () => {
    it("returns paged results", async () => {
      mockTransaction.mockResolvedValue([[prismaOutcomeLogRow], 1]);
      const result = await repo.findByContributorId("rec-001");
      expect(result.total).toBe(1);
      expect(result.items[0].contributorId).toBe("rec-001");
    });
  });

  describe("findByProtocolId", () => {
    it("returns paged results", async () => {
      mockTransaction.mockResolvedValue([[prismaOutcomeLogRow], 1]);
      const result = await repo.findByProtocolId("proto-001");
      expect(result.total).toBe(1);
    });
  });

  describe("create", () => {
    it("creates and returns a mapped outcome log", async () => {
      mockOutcomeLog.create.mockResolvedValue(prismaOutcomeLogRow);
      const result = await repo.create({
        contributorId: "rec-001",
        protocolId: "proto-001",
        notes: "Good progress",
        loggedAt: NOW_ISO,
      });
      expect(result.id).toBe("log-001");
      expect(result.notes).toBe("Good progress");
    });
  });
});

// ---------------------------------------------------------------------------
// Error mapping tests
// ---------------------------------------------------------------------------

describe("Repository error mapping", () => {
  it("wraps database errors as RepositoryErrorCode.DatabaseError", async () => {
    const repo = new PrismaContributorRepository();
    mockContributor.findUnique.mockRejectedValue(new Error("connection refused"));
    try {
      await repo.findById("any");
      fail("expected throw");
    } catch (err: unknown) {
      const repoErr = err as { code: RepositoryErrorCode };
      expect(repoErr.code).toBe(RepositoryErrorCode.DatabaseError);
    }
  });

  it("wraps P2002 as RepositoryErrorCode.Conflict", async () => {
    const repo = new PrismaContributorRepository();
    const { Prisma } = require("../../generated/prisma");
    const err = Object.assign(new Error("unique constraint"), {
      code: "P2002",
    });
    Object.setPrototypeOf(err, Prisma.PrismaClientKnownRequestError.prototype);
    mockContributor.create.mockRejectedValue(err);
    try {
      await repo.create({
        recordId: "dup",
        userId: "u",
        protocolId: "p",
        dataOrigin: DataOrigin.RealContributor,
        exclusionStatus: ExclusionStatus.Included,
        adherenceScore: 80,
        challengeCompletionRate: 70,
        recordedAt: NOW_ISO,
      });
      fail("expected throw");
    } catch (err: unknown) {
      const repoErr = err as { code: RepositoryErrorCode };
      expect(repoErr.code).toBe(RepositoryErrorCode.Conflict);
    }
  });
});
