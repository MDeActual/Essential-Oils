/**
 * types.ts — Oil Ontology Type Definitions
 *
 * Defines the canonical TypeScript types and enums for the Phyto.ai oil ontology.
 * These types implement the Oil entity defined in docs/DOMAIN_MODEL.md and extend
 * it with ontology classification structures per M-005 (Proprietary Oil Ontology).
 *
 * The full relational ontology graph is moat-protected (LOCK-002, M-005) and must
 * not be exported or exposed via external APIs.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/** Primary application methods for essential oils. */
export enum ApplicationMethod {
  Topical = "topical",
  Aromatic = "aromatic",
  Internal = "internal",
}

/** Therapeutic property categories derived from practitioner knowledge. */
export enum TherapeuticProperty {
  Calming = "calming",
  Energizing = "energizing",
  Grounding = "grounding",
  Uplifting = "uplifting",
  AntiInflammatory = "anti-inflammatory",
  Antimicrobial = "antimicrobial",
  Antioxidant = "antioxidant",
  Analgesic = "analgesic",
  Adaptogenic = "adaptogenic",
  Immunostimulant = "immunostimulant",
  Expectorant = "expectorant",
  Antispasmodic = "antispasmodic",
  Digestive = "digestive",
  Diuretic = "diuretic",
  Antifungal = "antifungal",
  Antiviral = "antiviral",
  Cicatrisant = "cicatrisant",
  Vulnerary = "vulnerary",
  Nervine = "nervine",
  Rubefacient = "rubefacient",
  CirculatoryStimulant = "circulatory_stimulant",
  HormonalSupport = "hormonal_support",
  Sedative = "sedative",
}

/**
 * Ontology remedy class — the primary classification node for an oil.
 * Drives ontology-aware substitution in the protocol engine.
 */
export enum RemedyClass {
  AromaticRelaxant = "aromatic_relaxant",
  AromaticStimulant = "aromatic_stimulant",
  TopicalAntiInflammatory = "topical_anti_inflammatory",
  TopicalAnalgesic = "topical_analgesic",
  ImmuneSupport = "immune_support",
  RespiratorySupport = "respiratory_support",
  DigestiveSupport = "digestive_support",
  HormonalSupport = "hormonal_support",
  SkinCare = "skin_care",
  AntimicrobialBroad = "antimicrobial_broad",
  GroundingEarthy = "grounding_earthy",
  CirculatoryStimulant = "circulatory_stimulant",
}

/** Route of administration (aligns with ApplicationMethod but used for ontology classification). */
export enum RouteType {
  Topical = "topical",
  Aromatic = "aromatic",
  Internal = "internal",
  Topical_Aromatic = "topical_aromatic",
  All = "all",
}

/** Safety tier classification. */
export enum SafetyTier {
  /** Generally recognized as safe for topical use diluted, aromatic use undiluted. */
  Low = "low",
  /** Requires dilution, patch test recommended, or limited aromatic exposure. */
  Moderate = "moderate",
  /** Contraindicated for certain populations; professional guidance recommended. */
  High = "high",
}

// ---------------------------------------------------------------------------
// Chemical Constituent
// ---------------------------------------------------------------------------

/** A primary chemical constituent found in an essential oil. */
export interface ChemicalConstituent {
  /** IUPAC or common name of the compound. */
  name: string;
  /** Approximate percentage range in the oil (e.g., "30-50%"). */
  percentageRange: string;
  /** The therapeutic or pharmacological role of this constituent. */
  role: string;
}

// ---------------------------------------------------------------------------
// Safety Profile
// ---------------------------------------------------------------------------

/** Safety information for an essential oil. */
export interface SafetyProfile {
  /** Overall safety tier classification. */
  tier: SafetyTier;
  /** Maximum dilution percentage for topical application (e.g., 2 for 2%). */
  maxDilutionPercent: number;
  /** Whether this oil is safe during pregnancy. */
  safeInPregnancy: boolean;
  /** Whether this oil is safe for children under 6. */
  safeForChildren: boolean;
  /** Whether this oil is photosensitizing (increases UV sensitivity). */
  photosensitizing: boolean;
  /** Known contraindications or special cautions. */
  contraindications: string[];
}

// ---------------------------------------------------------------------------
// Ontology Tags
// ---------------------------------------------------------------------------

/**
 * Ontology tags applied to an Oil entity for classification and substitution logic.
 * The full relational graph encoding these tags is moat-protected (M-005).
 */
export interface OntologyTags {
  /** Primary remedy class used for ontology-aware protocol substitutions. */
  remedyClass: RemedyClass;
  /** Secondary remedy classes (may apply when the oil spans multiple categories). */
  secondaryClasses: RemedyClass[];
  /** Supported route types in this ontology context. */
  routeTypes: RouteType[];
  /** Protocol roles this oil can fulfil (e.g., "primary", "supportive", "adjuvant"). */
  protocolRoles: string[];
  /** Canonical mechanism tags (e.g., "gaba_modulation", "cox_inhibition"). */
  mechanismTags: string[];
}

// ---------------------------------------------------------------------------
// Oil (Ontology Layer)
// ---------------------------------------------------------------------------

/**
 * Canonical Oil entity as defined in docs/DOMAIN_MODEL.md, extended with
 * ontology-layer fields. This is the authoritative representation within
 * src/ontology/ and is referenced by protocol and blend modules.
 */
export interface Oil {
  /** Unique canonical identifier (snake_case, e.g., "lavandula_angustifolia"). */
  oilId: OilId;
  /** Human-readable common name. */
  commonName: string;
  /** Botanical Latin name. */
  latinName: string;
  /** Plant family (e.g., "Lamiaceae"). */
  plantFamily: string;
  /** Primary chemical constituents. */
  chemicalConstituents: ChemicalConstituent[];
  /** Therapeutic properties of this oil. */
  therapeuticProperties: TherapeuticProperty[];
  /** Supported application methods. */
  applicationMethods: ApplicationMethod[];
  /** Safety profile and contraindications. */
  safetyProfile: SafetyProfile;
  /** Ontology classification tags (moat-protected graph asset). */
  ontologyTags: OntologyTags;
  /** Brief description for display purposes. */
  description: string;
  /** ISO 8601 date this ontology record was last reviewed. */
  lastReviewedAt: string;
}

// ---------------------------------------------------------------------------
// Canonical Oil Identifier (OilId)
// ---------------------------------------------------------------------------

/**
 * Exhaustive union of canonical oil identifiers used throughout the platform.
 * Identifiers follow the pattern: <genus>_<species>[_<subspecies>].
 * Adding a new oil requires updating this union and the OILS registry.
 */
export type OilId =
  | "lavandula_angustifolia"
  | "mentha_piperita"
  | "eucalyptus_globulus"
  | "melaleuca_alternifolia"
  | "origanum_vulgare"
  | "zingiber_officinale"
  | "boswellia_sacra"
  | "citrus_limon"
  | "citrus_bergamia"
  | "rosa_damascena"
  | "chamomilla_recutita"
  | "cymbopogon_flexuosus"
  | "santalum_album"
  | "cinnamomum_verum"
  | "pelargonium_graveolens"
  | "vetiveria_zizanioides"
  | "cedrus_atlantica"
  | "juniperus_communis"
  | "pogostemon_cablin"
  | "cananga_odorata";

// ---------------------------------------------------------------------------
// Ontology Validation Error
// ---------------------------------------------------------------------------

/** Structured validation error returned by the ontology validation layer. */
export interface OntologyValidationError {
  /** The oil identifier that failed validation, if applicable. */
  oilId?: string;
  /** The field or rule that failed. */
  field: string;
  /** Human-readable description of the violation. */
  message: string;
}

/** Result of an ontology validation operation. */
export interface OntologyValidationResult {
  valid: boolean;
  errors: OntologyValidationError[];
}
