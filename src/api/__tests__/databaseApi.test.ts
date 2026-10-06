import request from "supertest";
import {
  DataOrigin,
  ExclusionReason,
  ExclusionStatus,
} from "../../analytics/types";
import { LOCAL_DEVELOPMENT_TENANT_ID } from "../../db/tenant";
import { Protocol, ProtocolStatus } from "../../protocol/types";
import { createApp } from "../server";
import { loadRuntimeConfig } from "../runtime";

const mockFindProtocolById = jest.fn();
const mockFindProtocolByStatus = jest.fn();
const mockFindContributorsByDataOrigin = jest.fn();

jest.mock("../../db/implementations/PrismaProtocolRepository", () => ({
  PrismaProtocolRepository: jest.fn().mockImplementation(() => ({
    findById: (...args: unknown[]) => mockFindProtocolById(...args),
    findByStatus: (...args: unknown[]) => mockFindProtocolByStatus(...args),
  })),
}));

jest.mock("../../db/implementations/PrismaContributorRepository", () => ({
  PrismaContributorRepository: jest.fn().mockImplementation(() => ({
    findByDataOrigin: (...args: unknown[]) =>
      mockFindContributorsByDataOrigin(...args),
  })),
}));

const protocol: Protocol = {
  protocolId: "protocol-001",
  version: "1.0.0",
  userProfileId: "user-001",
  goal: "Stress relief",
  phases: [
    {
      phaseIndex: 0,
      label: "Preparation",
      durationDays: 7,
      blendIds: [],
      oilIds: [],
      instructions: "Use the protocol as directed.",
    },
  ],
  durationDays: 7,
  challengeIds: ["challenge-001"],
  createdAt: "2026-04-10T08:00:00.000Z",
  status: ProtocolStatus.Active,
};

const contributorRecords = [
  {
    recordId: "real-001",
    userId: "user-001",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 85,
    challengeCompletionRate: 90,
    recordedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    recordId: "real-002",
    userId: "user-002",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 70,
    challengeCompletionRate: 75,
    recordedAt: "2026-04-11T10:00:00.000Z",
  },
  {
    recordId: "real-low",
    userId: "user-003",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    adherenceScore: 30,
    challengeCompletionRate: 40,
    recordedAt: "2026-04-11T11:00:00.000Z",
  },
  {
    recordId: "synthetic-001",
    userId: "user-synthetic",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.SyntheticSimulation,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 99,
    challengeCompletionRate: 100,
    recordedAt: "2026-04-12T10:00:00.000Z",
  },
];

const app = createApp(
  loadRuntimeConfig({
    NODE_ENV: "test",
    PHYTO_STORAGE_MODE: "database",
    PHYTO_AUTH_MODE: "disabled",
    DATABASE_URL: "postgresql://localhost:5432/phytoai",
  })
);

beforeEach(() => {
  jest.clearAllMocks();
  mockFindProtocolById.mockImplementation(async (protocolId: string) =>
    protocolId === protocol.protocolId ? protocol : null
  );
  mockFindProtocolByStatus.mockImplementation(async (status: ProtocolStatus) => {
    const items = status === ProtocolStatus.Active ? [protocol] : [];
    return { items, total: items.length };
  });
  mockFindContributorsByDataOrigin.mockImplementation(async (origin: DataOrigin) => {
    const items = contributorRecords.filter((record) => record.dataOrigin === origin);
    return { items, total: items.length };
  });
});

describe("database-backed API reads", () => {
  it("serves GET /protocols through the tenant-bound Prisma repository", async () => {
    const response = await request(app).get("/protocols").expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      protocolId: "protocol-001",
      phaseCount: 1,
    });
    const { PrismaProtocolRepository } = jest.requireMock(
      "../../db/implementations/PrismaProtocolRepository"
    ) as { PrismaProtocolRepository: jest.Mock };
    expect(PrismaProtocolRepository).toHaveBeenCalledWith(
      LOCAL_DEVELOPMENT_TENANT_ID
    );
  });

  it("serves GET /protocols/:id through the Prisma-backed service", async () => {
    const response = await request(app)
      .get("/protocols/protocol-001")
      .expect(200);

    expect(response.body.data).toMatchObject({
      protocolId: "protocol-001",
      phases: [{ label: "Preparation" }],
      challengeCount: 1,
    });
  });

  it("serves GET /analytics/protocols using real contributors only", async () => {
    const response = await request(app).get("/analytics/protocols").expect(200);

    expect(response.body.data.totalEligibleRecords).toBe(2);
    expect(response.body.data.totalExcludedRecords).toBe(1);
    expect(mockFindContributorsByDataOrigin).toHaveBeenCalledWith(
      DataOrigin.RealContributor
    );
  });

  it("serves GET /analytics/protocols/:id with low-adherence records excluded", async () => {
    const response = await request(app)
      .get("/analytics/protocols/protocol-001")
      .expect(200);

    expect(response.body.data).toMatchObject({
      protocolId: "protocol-001",
      eligibleRecordCount: 2,
      excludedRecordCount: 1,
      averageAdherenceScore: 77.5,
    });
    expect(mockFindContributorsByDataOrigin).toHaveBeenCalledWith(
      DataOrigin.RealContributor
    );
  });
});
