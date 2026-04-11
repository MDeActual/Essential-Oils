/**
 * blend.test.ts — Blend Module Tests
 *
 * Tests for:
 * - Blend type constraints and schema correctness
 * - validateBlend() — valid and invalid records
 * - validateBlendCollection() — uniqueness and aggregation
 * - Cross-field business rules (min oils, primary role, duplicate oilId)
 * - Moat boundary: synergyScore is accepted as a pre-computed value only (no computation logic)
 */

import {
  ApplicationMethod,
  BLEND_MAX_OILS,
  BLEND_MIN_OILS,
  BlendRole,
  BlendSafetyStatus,
  SYNERGY_SCORE_MAX,
  SYNERGY_SCORE_MIN,
  VALID_BLEND_ROLES,
  validateBlend,
  validateBlendCollection,
} from "../index";
import type { Blend, BlendOilEntry } from "../index";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** A minimal valid BlendOilEntry using a registered canonical oil. */
function makeOilEntry(
  oilId: string,
  ratio: number,
  role: BlendRole
): BlendOilEntry {
  return { oilId: oilId as never, ratio, role };
}

/** Factory for a valid Blend record. */
function makeBlend(overrides: Partial<Blend> = {}): Blend {
  return {
    blendId: "blend-lavender-frankincense",
    oils: [
      makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
      makeOilEntry("boswellia_sacra", 2, BlendRole.Supportive),
    ],
    synergyScore: 82,
    applicationMethod: ApplicationMethod.Aromatic,
    intendedEffect: "Calming and grounding aromatic blend",
    safetyStatus: BlendSafetyStatus.Validated,
    createdAt: "2026-04-11T00:00:00Z",
    lastReviewedAt: "2026-04-11",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Schema and constants
// ---------------------------------------------------------------------------

describe("Blend module constants", () => {
  it("BLEND_MIN_OILS is 2", () => {
    expect(BLEND_MIN_OILS).toBe(2);
  });

  it("BLEND_MAX_OILS is 10", () => {
    expect(BLEND_MAX_OILS).toBe(10);
  });

  it("SYNERGY_SCORE_MIN is 0", () => {
    expect(SYNERGY_SCORE_MIN).toBe(0);
  });

  it("SYNERGY_SCORE_MAX is 100", () => {
    expect(SYNERGY_SCORE_MAX).toBe(100);
  });

  it("VALID_BLEND_ROLES contains all BlendRole values", () => {
    for (const role of Object.values(BlendRole)) {
      expect(VALID_BLEND_ROLES.has(role)).toBe(true);
    }
  });

  it("BlendRole enum contains expected roles", () => {
    expect(BlendRole.Primary).toBe("primary");
    expect(BlendRole.Supportive).toBe("supportive");
    expect(BlendRole.Adjuvant).toBe("adjuvant");
    expect(BlendRole.Synergist).toBe("synergist");
    expect(BlendRole.Carrier).toBe("carrier");
  });

  it("BlendSafetyStatus enum contains expected values", () => {
    expect(BlendSafetyStatus.Validated).toBe("validated");
    expect(BlendSafetyStatus.Pending).toBe("pending");
    expect(BlendSafetyStatus.Rejected).toBe("rejected");
  });
});

// ---------------------------------------------------------------------------
// validateBlend — valid records
// ---------------------------------------------------------------------------

describe("validateBlend — valid records", () => {
  it("returns valid=true for a minimal valid blend (2 oils)", () => {
    const result = validateBlend(makeBlend());
    if (!result.valid) console.error(result.errors);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid=true for a blend with 3 oils", () => {
    const blend = makeBlend({
      blendId: "blend-three-oil",
      oils: [
        makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
        makeOilEntry("boswellia_sacra", 2, BlendRole.Supportive),
        makeOilEntry("santalum_album", 1, BlendRole.Adjuvant),
      ],
    });
    const result = validateBlend(blend);
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for a blend with synergyScore at boundary (0)", () => {
    const result = validateBlend(makeBlend({ synergyScore: 0 }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for a blend with synergyScore at boundary (100)", () => {
    const result = validateBlend(makeBlend({ synergyScore: 100 }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for Topical application method", () => {
    const result = validateBlend(makeBlend({ applicationMethod: ApplicationMethod.Topical }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for Internal application method", () => {
    const result = validateBlend(makeBlend({ applicationMethod: ApplicationMethod.Internal }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for BlendSafetyStatus.Pending", () => {
    const result = validateBlend(makeBlend({ safetyStatus: BlendSafetyStatus.Pending }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for BlendSafetyStatus.Rejected", () => {
    const result = validateBlend(makeBlend({ safetyStatus: BlendSafetyStatus.Rejected }));
    expect(result.valid).toBe(true);
  });

  it("returns valid=true for a blend with a carrier oil entry", () => {
    const blend = makeBlend({
      blendId: "blend-with-carrier",
      oils: [
        makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
        makeOilEntry("boswellia_sacra", 2, BlendRole.Supportive),
        makeOilEntry("juniperus_communis", 5, BlendRole.Carrier),
      ],
    });
    const result = validateBlend(blend);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateBlend — top-level field errors
// ---------------------------------------------------------------------------

describe("validateBlend — top-level field errors", () => {
  it("reports error when blendId is empty string", () => {
    const result = validateBlend(makeBlend({ blendId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "blendId")).toBe(true);
  });

  it("reports error when blendId has invalid format (uppercase)", () => {
    const result = validateBlend(makeBlend({ blendId: "BLEND-LAVENDER" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "blendId")).toBe(true);
  });

  it("reports error when blendId has invalid format (starts with hyphen)", () => {
    const result = validateBlend(makeBlend({ blendId: "-blend-lavender" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "blendId")).toBe(true);
  });

  it("reports error when synergyScore is below 0", () => {
    const result = validateBlend(makeBlend({ synergyScore: -1 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "synergyScore")).toBe(true);
  });

  it("reports error when synergyScore is above 100", () => {
    const result = validateBlend(makeBlend({ synergyScore: 101 }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "synergyScore")).toBe(true);
  });

  it("reports error when applicationMethod is unknown", () => {
    const result = validateBlend(makeBlend({ applicationMethod: "vaporized" as ApplicationMethod }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "applicationMethod")).toBe(true);
  });

  it("reports error when intendedEffect is missing", () => {
    const result = validateBlend(makeBlend({ intendedEffect: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "intendedEffect")).toBe(true);
  });

  it("reports error when safetyStatus is unknown", () => {
    const result = validateBlend(makeBlend({ safetyStatus: "unknown_status" as BlendSafetyStatus }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "safetyStatus")).toBe(true);
  });

  it("reports error when createdAt has invalid format", () => {
    const result = validateBlend(makeBlend({ createdAt: "April 11 2026" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "createdAt")).toBe(true);
  });

  it("reports error when lastReviewedAt has invalid format", () => {
    const result = validateBlend(makeBlend({ lastReviewedAt: "11-04-2026" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "lastReviewedAt")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateBlend — oils array business rules
// ---------------------------------------------------------------------------

describe("validateBlend — oils array business rules", () => {
  it("reports error when blend has fewer than 2 oils", () => {
    const result = validateBlend(
      makeBlend({
        oils: [makeOilEntry("lavandula_angustifolia", 1, BlendRole.Primary)],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "oils")).toBe(true);
  });

  it("reports error when blend has more than BLEND_MAX_OILS entries", () => {
    const oils: BlendOilEntry[] = [
      makeOilEntry("lavandula_angustifolia", 1, BlendRole.Primary),
      makeOilEntry("mentha_piperita", 1, BlendRole.Supportive),
      makeOilEntry("eucalyptus_globulus", 1, BlendRole.Supportive),
      makeOilEntry("melaleuca_alternifolia", 1, BlendRole.Adjuvant),
      makeOilEntry("origanum_vulgare", 1, BlendRole.Adjuvant),
      makeOilEntry("zingiber_officinale", 1, BlendRole.Synergist),
      makeOilEntry("boswellia_sacra", 1, BlendRole.Synergist),
      makeOilEntry("citrus_limon", 1, BlendRole.Carrier),
      makeOilEntry("citrus_bergamia", 1, BlendRole.Carrier),
      makeOilEntry("rosa_damascena", 1, BlendRole.Supportive),
      makeOilEntry("santalum_album", 1, BlendRole.Supportive), // 11th entry
    ];
    const result = validateBlend(makeBlend({ oils }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "oils")).toBe(true);
  });

  it("reports error when no oil has the Primary role", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("lavandula_angustifolia", 3, BlendRole.Supportive),
          makeOilEntry("boswellia_sacra", 2, BlendRole.Supportive),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "oils" && e.message.includes("primary"))).toBe(true);
  });

  it("reports error when more than one oil has the Primary role", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
          makeOilEntry("boswellia_sacra", 2, BlendRole.Primary),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "oils" && e.message.includes("primary"))).toBe(true);
  });

  it("reports error when the same oilId appears twice", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
          makeOilEntry("lavandula_angustifolia", 2, BlendRole.Supportive),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
  });

  it("reports error when an oil ratio is zero", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
          makeOilEntry("boswellia_sacra", 0, BlendRole.Supportive),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("ratio"))).toBe(true);
  });

  it("reports error when an oil ratio is negative", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
          makeOilEntry("boswellia_sacra", -1, BlendRole.Supportive),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("ratio"))).toBe(true);
  });

  it("reports error when an oilId is not registered in the ontology", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
          makeOilEntry("unknown_plant_xyz", 2, BlendRole.Supportive),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("oilId") && e.message.includes("unknown_plant_xyz"))).toBe(true);
  });

  it("reports error when an oil entry has an unknown role", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("lavandula_angustifolia", 3, BlendRole.Primary),
          makeOilEntry("boswellia_sacra", 2, "dominant" as BlendRole),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("role"))).toBe(true);
  });

  it("reports error when an oil entry oilId has invalid snake_case format", () => {
    const result = validateBlend(
      makeBlend({
        oils: [
          makeOilEntry("Lavandula_angustifolia", 3, BlendRole.Primary), // uppercase
          makeOilEntry("boswellia_sacra", 2, BlendRole.Supportive),
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.includes("oilId"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateBlend — moat boundary guard
// ---------------------------------------------------------------------------

describe("validateBlend — moat boundary (M-001)", () => {
  it("accepts synergyScore as an opaque numeric value without recomputing it", () => {
    // The validation layer must not recompute or expose scoring logic.
    // It only checks that the provided value is within the valid range.
    const blend50 = makeBlend({ synergyScore: 50 });
    const blend99 = makeBlend({ blendId: "blend-second", synergyScore: 99 });
    expect(validateBlend(blend50).valid).toBe(true);
    expect(validateBlend(blend99).valid).toBe(true);
  });

  it("rejects a synergyScore outside [0, 100] regardless of other fields", () => {
    expect(validateBlend(makeBlend({ synergyScore: -0.1 })).valid).toBe(false);
    expect(validateBlend(makeBlend({ synergyScore: 100.1 })).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateBlendCollection
// ---------------------------------------------------------------------------

describe("validateBlendCollection — valid collection", () => {
  it("returns valid=true for a collection of distinct valid blends", () => {
    const blends: Blend[] = [
      makeBlend({ blendId: "blend-alpha" }),
      makeBlend({
        blendId: "blend-beta",
        oils: [
          makeOilEntry("mentha_piperita", 2, BlendRole.Primary),
          makeOilEntry("eucalyptus_globulus", 3, BlendRole.Supportive),
        ],
      }),
    ];
    const result = validateBlendCollection(blends);
    if (!result.valid) console.error(result.errors);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid=true for an empty collection", () => {
    const result = validateBlendCollection([]);
    expect(result.valid).toBe(true);
  });
});

describe("validateBlendCollection — invalid collection", () => {
  it("reports error for duplicate blendId", () => {
    const blends: Blend[] = [makeBlend(), makeBlend()]; // same blendId
    const result = validateBlendCollection(blends);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
  });

  it("aggregates errors from multiple invalid blends", () => {
    const blends: Blend[] = [
      makeBlend({ blendId: "blend-a", intendedEffect: "" }), // invalid effect
      makeBlend({ blendId: "blend-b", synergyScore: 150 }), // invalid score
    ];
    const result = validateBlendCollection(blends);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("detects duplicate blendId and also validates individual records", () => {
    const invalid = makeBlend({ intendedEffect: "" }); // same blendId as base, and invalid
    const blends: Blend[] = [makeBlend(), invalid];
    const result = validateBlendCollection(blends);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
    expect(result.errors.some((e) => e.field === "intendedEffect")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BlendRole and ApplicationMethod enum alignment
// ---------------------------------------------------------------------------

describe("Enum alignment with ontology layer", () => {
  it("ApplicationMethod re-export matches ontology ApplicationMethod values", () => {
    expect(ApplicationMethod.Topical).toBe("topical");
    expect(ApplicationMethod.Aromatic).toBe("aromatic");
    expect(ApplicationMethod.Internal).toBe("internal");
  });
});
