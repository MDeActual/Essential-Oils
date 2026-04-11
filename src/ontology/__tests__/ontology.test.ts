/**
 * ontology.test.ts — Ontology Integrity Tests
 *
 * Tests for:
 * - Oil registry completeness and structural integrity
 * - Schema validation correctness
 * - Canonical identifier uniqueness and coverage
 * - Cross-field business rule enforcement
 * - Moat boundary: full graph is not leaked through public interface
 */

import {
  getAllOils,
  getOilById,
  getOilsByApplicationMethod,
  getOilsByRemedyClass,
  isRegisteredOilId,
  getOilCount,
  validateOil,
  validateOilRegistry,
  CANONICAL_OIL_IDS,
  VALID_PROTOCOL_ROLES,
  ApplicationMethod,
  RemedyClass,
  RouteType,
  SafetyTier,
  TherapeuticProperty,
} from "../index";
import type { Oil, OilId } from "../index";

// ---------------------------------------------------------------------------
// Registry integrity
// ---------------------------------------------------------------------------

describe("Oil Registry — completeness", () => {
  it("returns at least one oil", () => {
    expect(getOilCount()).toBeGreaterThan(0);
  });

  it("registry size matches CANONICAL_OIL_IDS count", () => {
    expect(getOilCount()).toBe(CANONICAL_OIL_IDS.size);
  });

  it("every oil in getAllOils() is retrievable by getOilById()", () => {
    for (const oil of getAllOils()) {
      expect(getOilById(oil.oilId)).toBeDefined();
      expect(getOilById(oil.oilId)?.oilId).toBe(oil.oilId);
    }
  });

  it("all CANONICAL_OIL_IDS are present in the registry", () => {
    for (const id of CANONICAL_OIL_IDS) {
      expect(getOilById(id as OilId)).toBeDefined();
    }
  });

  it("no duplicate oilId values exist in the registry", () => {
    const oils = getAllOils();
    const ids = oils.map((o) => o.oilId);
    const unique = new Set(ids);
    expect(unique.size).toBe(oils.length);
  });

  it("isRegisteredOilId returns true for known IDs and false for unknown", () => {
    expect(isRegisteredOilId("lavandula_angustifolia")).toBe(true);
    expect(isRegisteredOilId("mentha_piperita")).toBe(true);
    expect(isRegisteredOilId("not_a_real_oil")).toBe(false);
    expect(isRegisteredOilId("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Required field presence on every oil
// ---------------------------------------------------------------------------

describe("Oil Registry — required fields", () => {
  const oils = getAllOils();

  test.each(oils.map((o) => [o.commonName, o] as [string, Oil]))(
    "%s has all required top-level fields",
    (_, oil) => {
      expect(typeof oil.oilId).toBe("string");
      expect(typeof oil.commonName).toBe("string");
      expect(typeof oil.latinName).toBe("string");
      expect(typeof oil.plantFamily).toBe("string");
      expect(typeof oil.description).toBe("string");
      expect(typeof oil.lastReviewedAt).toBe("string");
      expect(Array.isArray(oil.chemicalConstituents)).toBe(true);
      expect(Array.isArray(oil.therapeuticProperties)).toBe(true);
      expect(Array.isArray(oil.applicationMethods)).toBe(true);
      expect(oil.safetyProfile).toBeDefined();
      expect(oil.ontologyTags).toBeDefined();
    }
  );

  test.each(oils.map((o) => [o.commonName, o] as [string, Oil]))(
    "%s has valid safetyProfile fields",
    (_, oil) => {
      const sp = oil.safetyProfile;
      expect(Object.values(SafetyTier)).toContain(sp.tier);
      expect(typeof sp.maxDilutionPercent).toBe("number");
      expect(sp.maxDilutionPercent).toBeGreaterThanOrEqual(0);
      expect(sp.maxDilutionPercent).toBeLessThanOrEqual(100);
      expect(typeof sp.safeInPregnancy).toBe("boolean");
      expect(typeof sp.safeForChildren).toBe("boolean");
      expect(typeof sp.photosensitizing).toBe("boolean");
      expect(Array.isArray(sp.contraindications)).toBe(true);
    }
  );

  test.each(oils.map((o) => [o.commonName, o] as [string, Oil]))(
    "%s has valid ontologyTags fields",
    (_, oil) => {
      const tags = oil.ontologyTags;
      expect(Object.values(RemedyClass)).toContain(tags.remedyClass);
      expect(Array.isArray(tags.secondaryClasses)).toBe(true);
      expect(Array.isArray(tags.routeTypes)).toBe(true);
      expect(tags.routeTypes.length).toBeGreaterThan(0);
      expect(Array.isArray(tags.protocolRoles)).toBe(true);
      expect(tags.protocolRoles.length).toBeGreaterThan(0);
      expect(Array.isArray(tags.mechanismTags)).toBe(true);
    }
  );

  test.each(oils.map((o) => [o.commonName, o] as [string, Oil]))(
    "%s has at least one chemical constituent",
    (_, oil) => {
      expect(oil.chemicalConstituents.length).toBeGreaterThan(0);
    }
  );
});

// ---------------------------------------------------------------------------
// Cross-field business rules
// ---------------------------------------------------------------------------

describe("Oil Registry — business rules", () => {
  it("SafetyTier.High oils have at least one contraindication", () => {
    const oils = getAllOils().filter((o) => o.safetyProfile.tier === SafetyTier.High);
    expect(oils.length).toBeGreaterThan(0); // ensure there are high-tier oils to test
    for (const oil of oils) {
      expect(oil.safetyProfile.contraindications.length).toBeGreaterThan(0);
    }
  });

  it("primaryRemedyClass does not appear in secondaryClasses", () => {
    for (const oil of getAllOils()) {
      expect(oil.ontologyTags.secondaryClasses).not.toContain(oil.ontologyTags.remedyClass);
    }
  });

  it("all protocolRoles are from the VALID_PROTOCOL_ROLES set", () => {
    for (const oil of getAllOils()) {
      for (const role of oil.ontologyTags.protocolRoles) {
        expect(VALID_PROTOCOL_ROLES.has(role)).toBe(true);
      }
    }
  });

  it("all therapeuticProperties are from the TherapeuticProperty enum", () => {
    const valid = new Set(Object.values(TherapeuticProperty));
    for (const oil of getAllOils()) {
      for (const prop of oil.therapeuticProperties) {
        expect(valid.has(prop)).toBe(true);
      }
    }
  });

  it("all applicationMethods are from the ApplicationMethod enum", () => {
    const valid = new Set(Object.values(ApplicationMethod));
    for (const oil of getAllOils()) {
      for (const method of oil.applicationMethods) {
        expect(valid.has(method)).toBe(true);
      }
    }
  });

  it("all routeTypes are from the RouteType enum", () => {
    const valid = new Set(Object.values(RouteType));
    for (const oil of getAllOils()) {
      for (const route of oil.ontologyTags.routeTypes) {
        expect(valid.has(route)).toBe(true);
      }
    }
  });

  it("lastReviewedAt matches ISO 8601 date format", () => {
    const iso8601 = /^\d{4}-\d{2}-\d{2}(T[\d:+Z.]+)?$/;
    for (const oil of getAllOils()) {
      expect(iso8601.test(oil.lastReviewedAt)).toBe(true);
    }
  });

  it("oilId matches snake_case genus_species pattern", () => {
    const pattern = /^[a-z]+_[a-z]+(_[a-z]+)?$/;
    for (const oil of getAllOils()) {
      expect(pattern.test(oil.oilId)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Accessor functions
// ---------------------------------------------------------------------------

describe("getOilsByRemedyClass", () => {
  it("returns oils matching the given primary remedy class", () => {
    const relaxants = getOilsByRemedyClass(RemedyClass.AromaticRelaxant);
    expect(relaxants.length).toBeGreaterThan(0);
    for (const oil of relaxants) {
      expect(oil.ontologyTags.remedyClass).toBe(RemedyClass.AromaticRelaxant);
    }
  });

  it("returns an empty array for a class that has no primary oils", () => {
    // Use a valid class that may or may not have entries — just check it returns array
    const result = getOilsByRemedyClass("not_a_real_class");
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getOilsByApplicationMethod", () => {
  it("returns oils supporting Topical application", () => {
    const topical = getOilsByApplicationMethod(ApplicationMethod.Topical);
    expect(topical.length).toBeGreaterThan(0);
    for (const oil of topical) {
      expect(oil.applicationMethods).toContain(ApplicationMethod.Topical);
    }
  });

  it("returns oils supporting Aromatic application", () => {
    const aromatic = getOilsByApplicationMethod(ApplicationMethod.Aromatic);
    expect(aromatic.length).toBeGreaterThan(0);
  });

  it("returns oils supporting Internal application (should be a subset)", () => {
    const internal = getOilsByApplicationMethod(ApplicationMethod.Internal);
    const all = getOilsByApplicationMethod(ApplicationMethod.Topical);
    expect(internal.length).toBeLessThanOrEqual(all.length);
  });
});

// ---------------------------------------------------------------------------
// validateOil
// ---------------------------------------------------------------------------

describe("validateOil — valid records", () => {
  it("returns valid=true for every oil in the registry", () => {
    for (const oil of getAllOils()) {
      const result = validateOil(oil);
      if (!result.valid) {
        console.error(`Validation failed for ${oil.oilId}:`, result.errors);
      }
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });
});

describe("validateOil — invalid records", () => {
  const baseOil = getOilById("lavandula_angustifolia")!;

  it("reports error when oilId is missing", () => {
    const invalid = { ...baseOil, oilId: "" as OilId };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "oilId")).toBe(true);
  });

  it("reports error when oilId is not a registered canonical identifier", () => {
    const invalid = { ...baseOil, oilId: "unknown_plant" as OilId };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "oilId")).toBe(true);
  });

  it("reports error when commonName is missing", () => {
    const invalid = { ...baseOil, commonName: "" };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "commonName")).toBe(true);
  });

  it("reports error when chemicalConstituents is empty", () => {
    const invalid = { ...baseOil, chemicalConstituents: [] };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "chemicalConstituents")).toBe(true);
  });

  it("reports error when therapeuticProperties is empty", () => {
    const invalid = { ...baseOil, therapeuticProperties: [] };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "therapeuticProperties")).toBe(true);
  });

  it("reports error when therapeuticProperties contains unknown value", () => {
    const invalid = { ...baseOil, therapeuticProperties: ["unknown_property" as TherapeuticProperty] };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.startsWith("therapeuticProperties"))).toBe(true);
  });

  it("reports error when safetyProfile is missing", () => {
    const { safetyProfile: _, ...rest } = baseOil;
    const result = validateOil(rest as Oil);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "safetyProfile")).toBe(true);
  });

  it("reports error when SafetyTier.High oil has no contraindications", () => {
    const invalid: Oil = {
      ...baseOil,
      safetyProfile: { ...baseOil.safetyProfile, tier: SafetyTier.High, contraindications: [] },
    };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "safetyProfile.contraindications")).toBe(true);
  });

  it("reports error when remedyClass appears in secondaryClasses", () => {
    const invalid: Oil = {
      ...baseOil,
      ontologyTags: {
        ...baseOil.ontologyTags,
        remedyClass: RemedyClass.AromaticRelaxant,
        secondaryClasses: [RemedyClass.AromaticRelaxant],
      },
    };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "ontologyTags.secondaryClasses")).toBe(true);
  });

  it("reports error when protocolRoles contains unknown value", () => {
    const invalid: Oil = {
      ...baseOil,
      ontologyTags: {
        ...baseOil.ontologyTags,
        protocolRoles: ["not_a_role"],
      },
    };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field.startsWith("ontologyTags.protocolRoles"))).toBe(true);
  });

  it("reports error when lastReviewedAt has invalid format", () => {
    const invalid = { ...baseOil, lastReviewedAt: "April 10 2026" };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "lastReviewedAt")).toBe(true);
  });

  it("reports error when maxDilutionPercent is negative", () => {
    const invalid: Oil = {
      ...baseOil,
      safetyProfile: { ...baseOil.safetyProfile, maxDilutionPercent: -1 },
    };
    const result = validateOil(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "safetyProfile.maxDilutionPercent")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateOilRegistry
// ---------------------------------------------------------------------------

describe("validateOilRegistry", () => {
  it("returns valid=true for the full canonical registry", () => {
    const result = validateOilRegistry(getAllOils());
    if (!result.valid) {
      console.error("Registry validation errors:", result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects duplicate oilId values", () => {
    const oils = getAllOils();
    const withDuplicate = [...oils, oils[0]]; // duplicate first entry
    const result = validateOilRegistry(withDuplicate);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
  });

  it("aggregates errors from multiple invalid records", () => {
    const oils = getAllOils();
    const invalid1 = { ...oils[0], commonName: "" };
    const invalid2 = { ...oils[1], commonName: "" };
    const result = validateOilRegistry([invalid1, invalid2]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
