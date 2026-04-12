/**
 * api.test.ts — API Layer Integration Tests
 *
 * Tests cover all five read-only endpoints:
 *   GET /health
 *   GET /protocols
 *   GET /protocols/:id
 *   GET /analytics/protocols
 *   GET /analytics/protocols/:id
 *
 * Tests also verify:
 *   - Consistent ApiSuccessResponse / ApiErrorResponse envelope format
 *   - Error handling middleware (404, 400 validation, 500 fallback)
 *   - validateId middleware rejects malformed identifiers
 *   - Analytics data flows correctly through the pipeline
 *   - No moat-protected fields are exposed in responses
 *   - No regression to domain or analytics modules
 */

import request from "supertest";
import { createApp } from "../server";

const app = createApp();

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------

describe("GET /health", () => {
  it("returns 200 with success envelope and status ok", async () => {
    const res = await request(app).get("/health").expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
    expect(typeof res.body.data.version).toBe("string");
    expect(typeof res.body.data.uptime).toBe("number");
    expect(res.body.data.uptime).toBeGreaterThanOrEqual(0);
    expect(typeof res.body.generatedAt).toBe("string");
  });

  it("response contains version from package.json", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { version } = require("../../../package.json") as {
      version: string;
    };
    const res = await request(app).get("/health").expect(200);
    expect(res.body.data.version).toBe(version);
  });
});

// ---------------------------------------------------------------------------
// GET /protocols
// ---------------------------------------------------------------------------

describe("GET /protocols", () => {
  it("returns 200 with success envelope containing a non-empty array", async () => {
    const res = await request(app).get("/protocols").expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(typeof res.body.generatedAt).toBe("string");
  });

  it("each protocol summary has required fields", async () => {
    const res = await request(app).get("/protocols").expect(200);
    const summaries = res.body.data as Array<Record<string, unknown>>;

    for (const s of summaries) {
      expect(typeof s.protocolId).toBe("string");
      expect(typeof s.version).toBe("string");
      expect(typeof s.goal).toBe("string");
      expect(typeof s.durationDays).toBe("number");
      expect(typeof s.status).toBe("string");
      expect(typeof s.phaseCount).toBe("number");
      expect(typeof s.createdAt).toBe("string");
    }
  });

  it("protocol summaries do not expose moat-protected fields", async () => {
    const res = await request(app).get("/protocols").expect(200);
    const summaries = res.body.data as Array<Record<string, unknown>>;

    for (const s of summaries) {
      // Moat-protected fields must not appear
      expect(s).not.toHaveProperty("generationAlgorithm");
      expect(s).not.toHaveProperty("synergyScore");
      expect(s).not.toHaveProperty("challengeEngineRules");
      // userProfileId is PII — must not appear in list summaries
      expect(s).not.toHaveProperty("userProfileId");
      // challengeIds array is internal — only challengeCount is exposed in detail
      expect(s).not.toHaveProperty("challengeIds");
    }
  });

  it("returns seed protocol-001 in the list", async () => {
    const res = await request(app).get("/protocols").expect(200);
    const ids = (res.body.data as Array<{ protocolId: string }>).map(
      (p) => p.protocolId
    );
    expect(ids).toContain("protocol-001");
  });
});

// ---------------------------------------------------------------------------
// GET /protocols/:id
// ---------------------------------------------------------------------------

describe("GET /protocols/:id", () => {
  it("returns 200 with full protocol detail for a known id", async () => {
    const res = await request(app).get("/protocols/protocol-001").expect(200);

    expect(res.body.success).toBe(true);
    const d = res.body.data as Record<string, unknown>;
    expect(d.protocolId).toBe("protocol-001");
    expect(typeof d.version).toBe("string");
    expect(typeof d.goal).toBe("string");
    expect(typeof d.durationDays).toBe("number");
    expect(typeof d.status).toBe("string");
    expect(Array.isArray(d.phases)).toBe(true);
    expect(typeof d.challengeCount).toBe("number");
    expect(typeof d.createdAt).toBe("string");
  });

  it("each phase has required structural fields", async () => {
    const res = await request(app).get("/protocols/protocol-001").expect(200);
    const phases = res.body.data.phases as Array<Record<string, unknown>>;

    expect(phases.length).toBeGreaterThan(0);
    for (const ph of phases) {
      expect(typeof ph.phaseIndex).toBe("number");
      expect(typeof ph.label).toBe("string");
      expect(typeof ph.durationDays).toBe("number");
      expect(typeof ph.instructions).toBe("string");
    }
  });

  it("protocol detail does not expose moat-protected or internal fields", async () => {
    const res = await request(app).get("/protocols/protocol-001").expect(200);
    const d = res.body.data as Record<string, unknown>;

    expect(d).not.toHaveProperty("generationAlgorithm");
    expect(d).not.toHaveProperty("synergyScore");
    expect(d).not.toHaveProperty("challengeEngineRules");
    expect(d).not.toHaveProperty("challengeIds"); // internal array hidden; only count exposed
    expect(d).not.toHaveProperty("userProfileId");
  });

  it("phases do not expose internal blendIds or oilIds", async () => {
    const res = await request(app).get("/protocols/protocol-001").expect(200);
    const phases = res.body.data.phases as Array<Record<string, unknown>>;

    for (const ph of phases) {
      expect(ph).not.toHaveProperty("blendIds");
      expect(ph).not.toHaveProperty("oilIds");
    }
  });

  it("returns 404 for an unknown protocol id", async () => {
    const res = await request(app)
      .get("/protocols/does-not-exist")
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(typeof res.body.error.message).toBe("string");
  });

  it("returns 400 for a malformed id containing uppercase letters", async () => {
    const res = await request(app).get("/protocols/INVALID").expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for a malformed id containing special characters", async () => {
    const res = await request(app)
      .get("/protocols/bad_id!")
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ---------------------------------------------------------------------------
// GET /analytics/protocols
// ---------------------------------------------------------------------------

describe("GET /analytics/protocols", () => {
  it("returns 200 with success envelope containing analytics payload", async () => {
    const res = await request(app).get("/analytics/protocols").expect(200);

    expect(res.body.success).toBe(true);
    const d = res.body.data as Record<string, unknown>;
    expect(typeof d.protocolCount).toBe("number");
    expect(typeof d.totalEligibleRecords).toBe("number");
    expect(typeof d.totalExcludedRecords).toBe("number");
    expect(Array.isArray(d.segments)).toBe(true);
    expect(typeof d.generatedAt).toBe("string");
  });

  it("analytics correctly excludes low-adherence and synthetic records (LOCK-003)", async () => {
    const res = await request(app).get("/analytics/protocols").expect(200);
    const d = res.body.data as {
      totalEligibleRecords: number;
      totalExcludedRecords: number;
    };

    // Seed data has 3 eligible records and 1 excluded (low adherence)
    expect(d.totalEligibleRecords).toBe(3);
    expect(d.totalExcludedRecords).toBe(1);
  });

  it("each segment has required fields", async () => {
    const res = await request(app).get("/analytics/protocols").expect(200);
    const segments = res.body.data.segments as Array<Record<string, unknown>>;

    expect(segments.length).toBeGreaterThan(0);
    for (const seg of segments) {
      expect(typeof seg.protocolId).toBe("string");
      expect(typeof seg.eligibleRecordCount).toBe("number");
      expect(typeof seg.averageAdherenceScore).toBe("number");
      expect(typeof seg.averageChallengeCompletionRate).toBe("number");
    }
  });

  it("segments do not expose moat-protected signal extraction fields", async () => {
    const res = await request(app).get("/analytics/protocols").expect(200);
    const segments = res.body.data.segments as Array<Record<string, unknown>>;

    for (const seg of segments) {
      expect(seg).not.toHaveProperty("signalScore");
      expect(seg).not.toHaveProperty("evolutionRecommendation");
      expect(seg).not.toHaveProperty("weightingScheme");
    }
  });

  it("protocol-001 segment has correct eligible count from seed data", async () => {
    const res = await request(app).get("/analytics/protocols").expect(200);
    const segments = res.body.data.segments as Array<{
      protocolId: string;
      eligibleRecordCount: number;
    }>;

    const seg001 = segments.find((s) => s.protocolId === "protocol-001");
    expect(seg001).toBeDefined();
    expect(seg001!.eligibleRecordCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// GET /analytics/protocols/:id
// ---------------------------------------------------------------------------

describe("GET /analytics/protocols/:id", () => {
  it("returns 200 with detailed cohort metrics for a known protocol", async () => {
    const res = await request(app)
      .get("/analytics/protocols/protocol-001")
      .expect(200);

    expect(res.body.success).toBe(true);
    const d = res.body.data as Record<string, unknown>;
    expect(d.protocolId).toBe("protocol-001");
    expect(typeof d.eligibleRecordCount).toBe("number");
    expect(typeof d.excludedRecordCount).toBe("number");
    expect(typeof d.averageAdherenceScore).toBe("number");
    expect(typeof d.averageChallengeCompletionRate).toBe("number");
    expect(typeof d.minAdherenceScore).toBe("number");
    expect(typeof d.maxAdherenceScore).toBe("number");
    expect(typeof d.exclusionBreakdown).toBe("object");
    expect(typeof d.computedAt).toBe("string");
  });

  it("cohort metrics for protocol-001 match seed data expectations", async () => {
    const res = await request(app)
      .get("/analytics/protocols/protocol-001")
      .expect(200);
    const d = res.body.data as {
      eligibleRecordCount: number;
      averageAdherenceScore: number;
      minAdherenceScore: number;
      maxAdherenceScore: number;
    };

    // Seed: records with adherenceScore 85 and 70 are eligible
    expect(d.eligibleRecordCount).toBe(2);
    expect(d.averageAdherenceScore).toBe(77.5);
    expect(d.minAdherenceScore).toBe(70);
    expect(d.maxAdherenceScore).toBe(85);
  });

  it("returns 404 for a protocol with no analytics data", async () => {
    const res = await request(app)
      .get("/analytics/protocols/no-data-here")
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 for a malformed id", async () => {
    const res = await request(app)
      .get("/analytics/protocols/INVALID_ID")
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("detail response does not expose moat-protected signal extraction fields", async () => {
    const res = await request(app)
      .get("/analytics/protocols/protocol-001")
      .expect(200);
    const d = res.body.data as Record<string, unknown>;

    expect(d).not.toHaveProperty("signalScore");
    expect(d).not.toHaveProperty("evolutionRecommendation");
    expect(d).not.toHaveProperty("weightingScheme");
  });
});

// ---------------------------------------------------------------------------
// 404 catch-all for unknown routes
// ---------------------------------------------------------------------------

describe("Unknown routes", () => {
  it("returns 404 with error envelope for unregistered GET routes", async () => {
    const res = await request(app).get("/unknown-resource").expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for POST requests (read-only enforcement)", async () => {
    const res = await request(app).post("/protocols").send({}).expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for DELETE requests (read-only enforcement)", async () => {
    const res = await request(app)
      .delete("/protocols/protocol-001")
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
