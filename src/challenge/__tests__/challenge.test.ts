/**
 * challenge.test.ts — Challenge Lifecycle Module Tests
 *
 * Tests for:
 * - ChallengeLifecycleEventType enum values
 * - VALID_TRANSITIONS state machine map correctness
 * - validateChallengeTransition() — valid and invalid transitions
 * - validateChallengeParticipation() — valid records and rule violations
 * - validateChallengeCompletionRecord() — valid completed/skipped records and violations
 * - validateChallengeCompletionRecordCollection() — uniqueness and aggregation
 * - Moat boundary: no challenge engine rule evaluation logic (M-003)
 */

import {
  CHALLENGE_RECORD_ID_MAX_LENGTH,
  CHALLENGE_RESPONSE_MAX_LENGTH,
  CHALLENGE_SKIP_REASON_MAX_LENGTH,
  ChallengeCompletionStatus,
  ChallengeLifecycleEventType,
  ChallengeType,
  VALID_TRANSITIONS,
  validateChallengeCompletionRecord,
  validateChallengeCompletionRecordCollection,
  validateChallengeParticipation,
  validateChallengeTransition,
} from "../index";
import type {
  ChallengeCompletionRecord,
  ChallengeParticipation,
  ChallengeTransition,
} from "../index";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeTransition(
  overrides: Partial<ChallengeTransition> = {}
): ChallengeTransition {
  return {
    challengeId: "challenge-day1-checkin",
    fromStatus: ChallengeCompletionStatus.Pending,
    toStatus: ChallengeCompletionStatus.Completed,
    occurredAt: "2026-04-11T08:00:00Z",
    ...overrides,
  };
}

function makeParticipation(
  overrides: Partial<ChallengeParticipation> = {}
): ChallengeParticipation {
  return {
    participationId: "participation-abc-001",
    challengeId: "challenge-day1-checkin",
    protocolId: "protocol-sleep-support",
    userId: "user-abc123",
    eventType: ChallengeLifecycleEventType.Completed,
    occurredAt: "2026-04-11T08:00:00Z",
    response: "Applied lavender blend to wrists before sleep.",
    ...overrides,
  };
}

function makeCompletionRecord(
  overrides: Partial<ChallengeCompletionRecord> = {}
): ChallengeCompletionRecord {
  return {
    recordId: "completion-abc-001",
    challengeId: "challenge-day1-checkin",
    protocolId: "protocol-sleep-support",
    userId: "user-abc123",
    finalStatus: ChallengeCompletionStatus.Completed,
    completedAt: "2026-04-11T08:00:00Z",
    response: "Applied lavender blend to wrists before sleep.",
    wasTimely: true,
    ...overrides,
  };
}

function makeSkippedRecord(
  overrides: Partial<ChallengeCompletionRecord> = {}
): ChallengeCompletionRecord {
  return {
    recordId: "completion-abc-002",
    challengeId: "challenge-day2-education",
    protocolId: "protocol-sleep-support",
    userId: "user-abc123",
    finalStatus: ChallengeCompletionStatus.Skipped,
    completedAt: "2026-04-12T09:00:00Z",
    wasTimely: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Enum and constant tests
// ---------------------------------------------------------------------------

describe("ChallengeLifecycleEventType enum", () => {
  it("contains 'presented'", () => {
    expect(ChallengeLifecycleEventType.Presented).toBe("presented");
  });

  it("contains 'responded'", () => {
    expect(ChallengeLifecycleEventType.Responded).toBe("responded");
  });

  it("contains 'completed'", () => {
    expect(ChallengeLifecycleEventType.Completed).toBe("completed");
  });

  it("contains 'skipped'", () => {
    expect(ChallengeLifecycleEventType.Skipped).toBe("skipped");
  });

  it("contains 'expired'", () => {
    expect(ChallengeLifecycleEventType.Expired).toBe("expired");
  });

  it("has exactly 5 values", () => {
    expect(Object.values(ChallengeLifecycleEventType)).toHaveLength(5);
  });
});

describe("ChallengeCompletionStatus enum (re-exported)", () => {
  it("contains 'pending'", () => {
    expect(ChallengeCompletionStatus.Pending).toBe("pending");
  });

  it("contains 'completed'", () => {
    expect(ChallengeCompletionStatus.Completed).toBe("completed");
  });

  it("contains 'skipped'", () => {
    expect(ChallengeCompletionStatus.Skipped).toBe("skipped");
  });
});

describe("ChallengeType enum (re-exported)", () => {
  it("contains 'adherence'", () => {
    expect(ChallengeType.Adherence).toBe("adherence");
  });

  it("contains 'educational'", () => {
    expect(ChallengeType.Educational).toBe("educational");
  });

  it("contains 'experiential'", () => {
    expect(ChallengeType.Experiential).toBe("experiential");
  });
});

describe("Module constants", () => {
  it("CHALLENGE_RESPONSE_MAX_LENGTH is 5000", () => {
    expect(CHALLENGE_RESPONSE_MAX_LENGTH).toBe(5000);
  });

  it("CHALLENGE_SKIP_REASON_MAX_LENGTH is 1000", () => {
    expect(CHALLENGE_SKIP_REASON_MAX_LENGTH).toBe(1000);
  });

  it("CHALLENGE_RECORD_ID_MAX_LENGTH is 200", () => {
    expect(CHALLENGE_RECORD_ID_MAX_LENGTH).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// VALID_TRANSITIONS state machine
// ---------------------------------------------------------------------------

describe("VALID_TRANSITIONS state machine", () => {
  it("Pending can transition to Completed", () => {
    const allowed = VALID_TRANSITIONS.get(ChallengeCompletionStatus.Pending);
    expect(allowed?.has(ChallengeCompletionStatus.Completed)).toBe(true);
  });

  it("Pending can transition to Skipped", () => {
    const allowed = VALID_TRANSITIONS.get(ChallengeCompletionStatus.Pending);
    expect(allowed?.has(ChallengeCompletionStatus.Skipped)).toBe(true);
  });

  it("Pending cannot transition to Pending (no self-loop entry in set)", () => {
    const allowed = VALID_TRANSITIONS.get(ChallengeCompletionStatus.Pending);
    expect(allowed?.has(ChallengeCompletionStatus.Pending)).toBe(false);
  });

  it("Completed is a terminal state with no outgoing transitions", () => {
    const allowed = VALID_TRANSITIONS.get(ChallengeCompletionStatus.Completed);
    expect(allowed?.size).toBe(0);
  });

  it("Skipped is a terminal state with no outgoing transitions", () => {
    const allowed = VALID_TRANSITIONS.get(ChallengeCompletionStatus.Skipped);
    expect(allowed?.size).toBe(0);
  });

  it("all three statuses have entries in the map", () => {
    expect(VALID_TRANSITIONS.has(ChallengeCompletionStatus.Pending)).toBe(true);
    expect(VALID_TRANSITIONS.has(ChallengeCompletionStatus.Completed)).toBe(true);
    expect(VALID_TRANSITIONS.has(ChallengeCompletionStatus.Skipped)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeTransition — valid transitions
// ---------------------------------------------------------------------------

describe("validateChallengeTransition — valid transitions", () => {
  it("accepts Pending → Completed", () => {
    const result = validateChallengeTransition(makeTransition());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts Pending → Skipped", () => {
    const result = validateChallengeTransition(
      makeTransition({ toStatus: ChallengeCompletionStatus.Skipped })
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeTransition — invalid transitions
// ---------------------------------------------------------------------------

describe("validateChallengeTransition — invalid transitions", () => {
  it("rejects Completed → Pending (terminal state)", () => {
    const result = validateChallengeTransition(
      makeTransition({
        fromStatus: ChallengeCompletionStatus.Completed,
        toStatus: ChallengeCompletionStatus.Pending,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "toStatus")).toBe(true);
  });

  it("rejects Completed → Skipped (terminal state)", () => {
    const result = validateChallengeTransition(
      makeTransition({
        fromStatus: ChallengeCompletionStatus.Completed,
        toStatus: ChallengeCompletionStatus.Skipped,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "toStatus")).toBe(true);
  });

  it("rejects Skipped → Pending (terminal state)", () => {
    const result = validateChallengeTransition(
      makeTransition({
        fromStatus: ChallengeCompletionStatus.Skipped,
        toStatus: ChallengeCompletionStatus.Pending,
      })
    );
    expect(result.valid).toBe(false);
  });

  it("rejects Skipped → Completed (terminal state)", () => {
    const result = validateChallengeTransition(
      makeTransition({
        fromStatus: ChallengeCompletionStatus.Skipped,
        toStatus: ChallengeCompletionStatus.Completed,
      })
    );
    expect(result.valid).toBe(false);
  });

  it("rejects self-transition Pending → Pending", () => {
    const result = validateChallengeTransition(
      makeTransition({
        fromStatus: ChallengeCompletionStatus.Pending,
        toStatus: ChallengeCompletionStatus.Pending,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe("toStatus");
    expect(result.errors[0].message).toContain("Self-transition");
  });

  it("rejects self-transition Completed → Completed", () => {
    const result = validateChallengeTransition(
      makeTransition({
        fromStatus: ChallengeCompletionStatus.Completed,
        toStatus: ChallengeCompletionStatus.Completed,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("Self-transition");
  });

  it("rejects missing challengeId", () => {
    const result = validateChallengeTransition(
      makeTransition({ challengeId: "" } as unknown as ChallengeTransition)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeId")).toBe(true);
  });

  it("rejects missing occurredAt", () => {
    const t = makeTransition();
    const bad = { ...t, occurredAt: "" };
    const result = validateChallengeTransition(bad);
    expect(result.valid).toBe(false);
  });

  it("rejects invalid occurredAt format", () => {
    const result = validateChallengeTransition(
      makeTransition({ occurredAt: "not-a-date" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "occurredAt")).toBe(true);
  });

  it("rejects invalid fromStatus value", () => {
    const result = validateChallengeTransition(
      makeTransition({ fromStatus: "unknown" as ChallengeCompletionStatus })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "fromStatus")).toBe(true);
  });

  it("rejects invalid toStatus value", () => {
    const result = validateChallengeTransition(
      makeTransition({ toStatus: "unknown" as ChallengeCompletionStatus })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "toStatus")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeParticipation — valid records
// ---------------------------------------------------------------------------

describe("validateChallengeParticipation — valid records", () => {
  it("accepts a valid Completed event with response", () => {
    const result = validateChallengeParticipation(makeParticipation());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a valid Responded event with response", () => {
    const result = validateChallengeParticipation(
      makeParticipation({ eventType: ChallengeLifecycleEventType.Responded })
    );
    expect(result.valid).toBe(true);
  });

  it("accepts a valid Presented event (no response or skipReason)", () => {
    const p = makeParticipation({
      eventType: ChallengeLifecycleEventType.Presented,
    });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(true);
  });

  it("accepts a valid Expired event (no response or skipReason)", () => {
    const p = makeParticipation({
      eventType: ChallengeLifecycleEventType.Expired,
    });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(true);
  });

  it("accepts a valid Skipped event without skipReason", () => {
    const p = makeParticipation({
      eventType: ChallengeLifecycleEventType.Skipped,
    });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(true);
  });

  it("accepts a valid Skipped event with optional skipReason", () => {
    const p = makeParticipation({
      eventType: ChallengeLifecycleEventType.Skipped,
      skipReason: "Not the right time for this challenge.",
    });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeParticipation — field errors
// ---------------------------------------------------------------------------

describe("validateChallengeParticipation — field errors", () => {
  it("rejects missing participationId", () => {
    const p = makeParticipation({ participationId: "" } as unknown as ChallengeParticipation);
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "participationId")).toBe(true);
  });

  it("rejects missing challengeId", () => {
    const result = validateChallengeParticipation(
      makeParticipation({ challengeId: "" } as unknown as ChallengeParticipation)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeId")).toBe(true);
  });

  it("rejects missing protocolId", () => {
    const result = validateChallengeParticipation(
      makeParticipation({ protocolId: "" } as unknown as ChallengeParticipation)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("rejects missing userId", () => {
    const result = validateChallengeParticipation(
      makeParticipation({ userId: "" } as unknown as ChallengeParticipation)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "userId")).toBe(true);
  });

  it("rejects invalid eventType", () => {
    const result = validateChallengeParticipation(
      makeParticipation({ eventType: "unknown" as ChallengeLifecycleEventType })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "eventType")).toBe(true);
  });

  it("rejects invalid occurredAt format", () => {
    const result = validateChallengeParticipation(
      makeParticipation({ occurredAt: "2026-04-11" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "occurredAt")).toBe(true);
  });

  it("rejects participationId with uppercase characters", () => {
    const result = validateChallengeParticipation(
      makeParticipation({ participationId: "Participation-ABC" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "participationId")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeParticipation — cross-field business rules
// ---------------------------------------------------------------------------

describe("validateChallengeParticipation — cross-field rules", () => {
  it("rejects Completed event without response", () => {
    const p = makeParticipation({ eventType: ChallengeLifecycleEventType.Completed });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects Responded event without response", () => {
    const p = makeParticipation({ eventType: ChallengeLifecycleEventType.Responded });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects Completed event with empty response", () => {
    const result = validateChallengeParticipation(
      makeParticipation({
        eventType: ChallengeLifecycleEventType.Completed,
        response: "",
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects Presented event with a response", () => {
    const result = validateChallengeParticipation(
      makeParticipation({
        eventType: ChallengeLifecycleEventType.Presented,
        response: "Some content",
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects Expired event with a response", () => {
    const result = validateChallengeParticipation(
      makeParticipation({
        eventType: ChallengeLifecycleEventType.Expired,
        response: "Some content",
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects Presented event with a skipReason", () => {
    const p = makeParticipation({
      eventType: ChallengeLifecycleEventType.Presented,
      skipReason: "Reason",
    });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "skipReason")).toBe(true);
  });

  it("rejects Expired event with a skipReason", () => {
    const p = makeParticipation({
      eventType: ChallengeLifecycleEventType.Expired,
      skipReason: "Reason",
    });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "skipReason")).toBe(true);
  });

  it("rejects Skipped event with a response", () => {
    const result = validateChallengeParticipation(
      makeParticipation({
        eventType: ChallengeLifecycleEventType.Skipped,
        response: "Some content",
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects empty skipReason string on a Skipped event", () => {
    const result = validateChallengeParticipation(
      makeParticipation({
        eventType: ChallengeLifecycleEventType.Skipped,
        skipReason: "",
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "skipReason")).toBe(true);
  });

  it("rejects response exceeding CHALLENGE_RESPONSE_MAX_LENGTH", () => {
    const result = validateChallengeParticipation(
      makeParticipation({
        eventType: ChallengeLifecycleEventType.Completed,
        response: "x".repeat(CHALLENGE_RESPONSE_MAX_LENGTH + 1),
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects skipReason exceeding CHALLENGE_SKIP_REASON_MAX_LENGTH", () => {
    const p = makeParticipation({
      eventType: ChallengeLifecycleEventType.Skipped,
      skipReason: "x".repeat(CHALLENGE_SKIP_REASON_MAX_LENGTH + 1),
    });
    delete (p as Partial<ChallengeParticipation>).response;
    const result = validateChallengeParticipation(p);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "skipReason")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeCompletionRecord — valid records
// ---------------------------------------------------------------------------

describe("validateChallengeCompletionRecord — valid completed records", () => {
  it("accepts a valid completed record with wasTimely=true", () => {
    const result = validateChallengeCompletionRecord(makeCompletionRecord());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a valid completed record with wasTimely=false", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ wasTimely: false })
    );
    expect(result.valid).toBe(true);
  });
});

describe("validateChallengeCompletionRecord — valid skipped records", () => {
  it("accepts a valid skipped record without skipReason", () => {
    const result = validateChallengeCompletionRecord(makeSkippedRecord());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a valid skipped record with skipReason", () => {
    const result = validateChallengeCompletionRecord(
      makeSkippedRecord({ skipReason: "Not applicable to current phase." })
    );
    expect(result.valid).toBe(true);
  });

  it("accepts a valid skipped record with wasTimely=true", () => {
    const result = validateChallengeCompletionRecord(
      makeSkippedRecord({ wasTimely: true })
    );
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeCompletionRecord — field errors
// ---------------------------------------------------------------------------

describe("validateChallengeCompletionRecord — field errors", () => {
  it("rejects missing recordId", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ recordId: "" } as unknown as ChallengeCompletionRecord)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId")).toBe(true);
  });

  it("rejects missing challengeId", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ challengeId: "" } as unknown as ChallengeCompletionRecord)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeId")).toBe(true);
  });

  it("rejects missing protocolId", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ protocolId: "" } as unknown as ChallengeCompletionRecord)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "protocolId")).toBe(true);
  });

  it("rejects missing userId", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ userId: "" } as unknown as ChallengeCompletionRecord)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "userId")).toBe(true);
  });

  it("rejects finalStatus of 'pending'", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({
        finalStatus: ChallengeCompletionStatus.Pending as never,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "finalStatus")).toBe(true);
  });

  it("rejects invalid completedAt format", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ completedAt: "2026-04-11" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "completedAt")).toBe(true);
  });

  it("rejects recordId with uppercase letters", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ recordId: "Completion-ABC" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeCompletionRecord — cross-field business rules
// ---------------------------------------------------------------------------

describe("validateChallengeCompletionRecord — cross-field rules", () => {
  it("rejects completed record without response", () => {
    const rec = makeCompletionRecord();
    delete (rec as Partial<ChallengeCompletionRecord>).response;
    const result = validateChallengeCompletionRecord(rec);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects completed record with empty response", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ response: "" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects completed record with response exceeding max length", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ response: "x".repeat(CHALLENGE_RESPONSE_MAX_LENGTH + 1) })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects completed record with a skipReason", () => {
    const result = validateChallengeCompletionRecord(
      makeCompletionRecord({ skipReason: "Reason should not be here" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "skipReason")).toBe(true);
  });

  it("rejects skipped record with a response", () => {
    const result = validateChallengeCompletionRecord(
      makeSkippedRecord({ response: "Should not be here" } as ChallengeCompletionRecord)
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "response")).toBe(true);
  });

  it("rejects skipped record with empty skipReason", () => {
    const result = validateChallengeCompletionRecord(
      makeSkippedRecord({ skipReason: "" })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "skipReason")).toBe(true);
  });

  it("rejects skipped record with skipReason exceeding max length", () => {
    const result = validateChallengeCompletionRecord(
      makeSkippedRecord({
        skipReason: "x".repeat(CHALLENGE_SKIP_REASON_MAX_LENGTH + 1),
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "skipReason")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateChallengeCompletionRecordCollection
// ---------------------------------------------------------------------------

describe("validateChallengeCompletionRecordCollection — valid collection", () => {
  it("accepts an empty collection", () => {
    const result = validateChallengeCompletionRecordCollection([]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a collection with one completed record", () => {
    const result = validateChallengeCompletionRecordCollection([makeCompletionRecord()]);
    expect(result.valid).toBe(true);
  });

  it("accepts a collection with one skipped record", () => {
    const result = validateChallengeCompletionRecordCollection([makeSkippedRecord()]);
    expect(result.valid).toBe(true);
  });

  it("accepts a mixed collection of completed and skipped records", () => {
    const result = validateChallengeCompletionRecordCollection([
      makeCompletionRecord(),
      makeSkippedRecord(),
    ]);
    expect(result.valid).toBe(true);
  });
});

describe("validateChallengeCompletionRecordCollection — uniqueness", () => {
  it("rejects duplicate recordId values", () => {
    const result = validateChallengeCompletionRecordCollection([
      makeCompletionRecord({ recordId: "completion-dup-001" }),
      makeSkippedRecord({ recordId: "completion-dup-001" }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "recordId")).toBe(true);
  });

  it("rejects duplicate challengeId values (one completion per challenge)", () => {
    const result = validateChallengeCompletionRecordCollection([
      makeCompletionRecord({ challengeId: "challenge-shared" }),
      makeSkippedRecord({
        recordId: "completion-abc-003",
        challengeId: "challenge-shared",
      }),
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "challengeId")).toBe(true);
  });

  it("aggregates errors from all records in the collection", () => {
    const badRecord = makeCompletionRecord({ recordId: "" } as unknown as ChallengeCompletionRecord);
    const result = validateChallengeCompletionRecordCollection([
      makeCompletionRecord(),
      badRecord,
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Moat boundary assertion (M-003)
// ---------------------------------------------------------------------------

describe("Moat boundary — M-003 challenge engine rules", () => {
  it("module does not export any challenge engine rule evaluation function", () => {
    // The public module interface must not expose functions that implement
    // the rule system governing when/how/why challenges are presented (M-003).
    // We verify that the known moat-unsafe function names are absent.
    const moduleExports = require("../index");
    const exportedKeys = Object.keys(moduleExports);

    const forbiddenNames = [
      "evaluateChallengeRules",
      "selectNextChallenge",
      "scheduleChallenge",
      "rankChallenges",
      "scoreChallengeRelevance",
      "personalizeChallenge",
    ];

    for (const name of forbiddenNames) {
      expect(exportedKeys).not.toContain(name);
    }
  });

  it("VALID_TRANSITIONS encodes only structural validity, not behavioral rules", () => {
    // The map must only contain entries for the three defined lifecycle states.
    expect(VALID_TRANSITIONS.size).toBe(3);
  });
});
