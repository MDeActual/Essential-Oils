import { PurposeLimitationService } from "../purpose-limitation";
import { ConsentRecord, ConsentRepository } from "../types";

class InMemoryConsentRepository implements ConsentRepository {
  constructor(private readonly consent: ConsentRecord | null) {}

  async findConsent(
    _input: Parameters<ConsentRepository["findConsent"]>[0],
  ): ReturnType<ConsentRepository["findConsent"]> {
    return this.consent;
  }
}

const baseConsent: ConsentRecord = {
  tenantId: "tenant-a",
  subjectId: "subject-1",
  purpose: "personalized_guidance",
  noticeVersion: "2026-08-06",
  grantedAt: new Date("2026-08-06T00:00:00.000Z"),
};

describe("PurposeLimitationService", () => {
  it("allows processing when matching active consent exists", async () => {
    const service = new PurposeLimitationService(
      new InMemoryConsentRepository(baseConsent),
    );

    await expect(
      service.authorize({
        tenantId: "tenant-a",
        subjectId: "subject-1",
        purpose: "personalized_guidance",
        classification: "wellness_sensitive",
      }),
    ).resolves.toEqual({ allowed: true, reason: "allowed" });
  });

  it("denies processing when consent is missing", async () => {
    const service = new PurposeLimitationService(
      new InMemoryConsentRepository(null),
    );

    await expect(
      service.authorize({
        tenantId: "tenant-a",
        subjectId: "subject-1",
        purpose: "personalized_guidance",
        classification: "wellness_sensitive",
      }),
    ).resolves.toEqual({ allowed: false, reason: "consent_missing" });
  });

  it("denies processing when consent has been revoked", async () => {
    const service = new PurposeLimitationService(
      new InMemoryConsentRepository({
        ...baseConsent,
        revokedAt: new Date("2026-08-06T01:00:00.000Z"),
      }),
    );

    await expect(
      service.authorize({
        tenantId: "tenant-a",
        subjectId: "subject-1",
        purpose: "personalized_guidance",
        classification: "wellness_sensitive",
      }),
    ).resolves.toEqual({ allowed: false, reason: "consent_revoked" });
  });

  it("denies cross-tenant consent reuse", async () => {
    const service = new PurposeLimitationService(
      new InMemoryConsentRepository(baseConsent),
    );

    await expect(
      service.authorize({
        tenantId: "tenant-b",
        subjectId: "subject-1",
        purpose: "personalized_guidance",
        classification: "wellness_sensitive",
      }),
    ).resolves.toEqual({ allowed: false, reason: "tenant_mismatch" });
  });

  it("denies cross-subject consent reuse", async () => {
    const service = new PurposeLimitationService(
      new InMemoryConsentRepository(baseConsent),
    );

    await expect(
      service.authorize({
        tenantId: "tenant-a",
        subjectId: "subject-2",
        purpose: "personalized_guidance",
        classification: "wellness_sensitive",
      }),
    ).resolves.toEqual({ allowed: false, reason: "subject_mismatch" });
  });
});
