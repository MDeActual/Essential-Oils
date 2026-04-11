/**
 * oils.ts — Canonical Oil Registry
 *
 * The authoritative registry of essential oil ontology records for the
 * Phyto.ai platform. Each entry is a fully-specified Oil object that
 * satisfies the OIL_SCHEMA and domain model constraints.
 *
 * MOAT NOTICE (M-005): This file contains the canonical ontology classification
 * data. The full relational graph, mechanism tags, and remedy class assignments
 * encode proprietary domain expertise. The complete registry must not be
 * exported via public-facing API endpoints. Individual oil property lookups
 * (by oilId) are permitted for display purposes.
 *
 * LOCK-001: Oil entity structure is locked per docs/ARCHITECTURE_LOCK.md.
 * Adding or renaming oils requires an ADR and updates to OilId in types.ts.
 */

import {
  ApplicationMethod,
  Oil,
  OilId,
  RemedyClass,
  RouteType,
  SafetyTier,
  TherapeuticProperty,
} from "./types";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const OILS_REGISTRY: ReadonlyMap<OilId, Oil> = new Map<OilId, Oil>([
  // -------------------------------------------------------------------------
  ["lavandula_angustifolia", {
    oilId: "lavandula_angustifolia",
    commonName: "Lavender",
    latinName: "Lavandula angustifolia",
    plantFamily: "Lamiaceae",
    chemicalConstituents: [
      { name: "Linalool", percentageRange: "25-40%", role: "Primary calming and analgesic constituent" },
      { name: "Linalyl acetate", percentageRange: "25-45%", role: "Antispasmodic and relaxing ester" },
      { name: "1,8-Cineole", percentageRange: "1-5%", role: "Mild expectorant" },
      { name: "Beta-ocimene", percentageRange: "2-6%", role: "Anti-inflammatory support" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Calming,
      TherapeuticProperty.Analgesic,
      TherapeuticProperty.Antispasmodic,
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Antimicrobial,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 5,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AromaticRelaxant,
      secondaryClasses: [RemedyClass.TopicalAntiInflammatory, RemedyClass.SkinCare],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive"],
      mechanismTags: ["gaba_modulation", "cox_inhibition"],
    },
    description:
      "Lavender (Lavandula angustifolia) is one of the most versatile essential oils, renowned for its calming, analgesic, and skin-healing properties.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["mentha_piperita", {
    oilId: "mentha_piperita",
    commonName: "Peppermint",
    latinName: "Mentha × piperita",
    plantFamily: "Lamiaceae",
    chemicalConstituents: [
      { name: "Menthol", percentageRange: "35-55%", role: "Cooling, analgesic, and antispasmodic" },
      { name: "Menthone", percentageRange: "14-30%", role: "Antispasmodic and digestive support" },
      { name: "1,8-Cineole", percentageRange: "3-10%", role: "Expectorant and respiratory support" },
      { name: "Menthyl acetate", percentageRange: "3-10%", role: "Mild relaxant ester" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Energizing,
      TherapeuticProperty.Analgesic,
      TherapeuticProperty.Digestive,
      TherapeuticProperty.Expectorant,
      TherapeuticProperty.Antispasmodic,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic, ApplicationMethod.Internal],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 3,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: ["Avoid near face of children under 6", "Avoid during first trimester"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AromaticStimulant,
      secondaryClasses: [RemedyClass.DigestiveSupport, RemedyClass.RespiratorySupport],
      routeTypes: [RouteType.All],
      protocolRoles: ["primary", "supportive", "adjuvant"],
      mechanismTags: ["trpv1_agonist", "trpm8_agonist", "cox_inhibition"],
    },
    description:
      "Peppermint (Mentha piperita) delivers an invigorating, cooling sensation and is widely used for digestive support, respiratory relief, and mental clarity.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["eucalyptus_globulus", {
    oilId: "eucalyptus_globulus",
    commonName: "Eucalyptus",
    latinName: "Eucalyptus globulus",
    plantFamily: "Myrtaceae",
    chemicalConstituents: [
      { name: "1,8-Cineole (Eucalyptol)", percentageRange: "60-85%", role: "Primary expectorant and antimicrobial" },
      { name: "Alpha-pinene", percentageRange: "3-10%", role: "Anti-inflammatory bronchodilator" },
      { name: "Limonene", percentageRange: "1-5%", role: "Antioxidant and mood support" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Expectorant,
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Antiviral,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 2,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: ["Avoid near face of children under 6", "May interact with certain medications"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.RespiratorySupport,
      secondaryClasses: [RemedyClass.AntimicrobialBroad],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive"],
      mechanismTags: ["mucolytic", "trpv4_modulation", "antimicrobial_broad"],
    },
    description:
      "Eucalyptus (Eucalyptus globulus) is a powerful respiratory and antimicrobial oil, dominated by 1,8-cineole and widely used for congestion and immune support.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["melaleuca_alternifolia", {
    oilId: "melaleuca_alternifolia",
    commonName: "Tea Tree",
    latinName: "Melaleuca alternifolia",
    plantFamily: "Myrtaceae",
    chemicalConstituents: [
      { name: "Terpinen-4-ol", percentageRange: "30-48%", role: "Primary antimicrobial and anti-inflammatory" },
      { name: "Gamma-terpinene", percentageRange: "10-28%", role: "Antioxidant support" },
      { name: "1,8-Cineole", percentageRange: "0-15%", role: "Expectorant (low levels preferred)" },
      { name: "Alpha-terpinene", percentageRange: "5-13%", role: "Antimicrobial synergist" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.Antifungal,
      TherapeuticProperty.Antiviral,
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Immunostimulant,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 5,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: ["Not for internal use"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AntimicrobialBroad,
      secondaryClasses: [RemedyClass.SkinCare, RemedyClass.ImmuneSupport],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "adjuvant"],
      mechanismTags: ["membrane_disruption", "terpinen_4_ol_activity"],
    },
    description:
      "Tea Tree (Melaleuca alternifolia) is the benchmark broad-spectrum antimicrobial and antifungal essential oil, widely used for skin and immune support.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["origanum_vulgare", {
    oilId: "origanum_vulgare",
    commonName: "Oregano",
    latinName: "Origanum vulgare",
    plantFamily: "Lamiaceae",
    chemicalConstituents: [
      { name: "Carvacrol", percentageRange: "60-80%", role: "Potent antimicrobial and antifungal" },
      { name: "Thymol", percentageRange: "1-10%", role: "Antimicrobial and antioxidant synergist" },
      { name: "Gamma-terpinene", percentageRange: "5-10%", role: "Antioxidant" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.Antifungal,
      TherapeuticProperty.Antiviral,
      TherapeuticProperty.Antioxidant,
      TherapeuticProperty.Immunostimulant,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Internal],
    safetyProfile: {
      tier: SafetyTier.High,
      maxDilutionPercent: 1,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: [
        "Must be heavily diluted for topical use",
        "Not for children",
        "Not for use during pregnancy",
        "May interact with anticoagulant medications",
      ],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AntimicrobialBroad,
      secondaryClasses: [RemedyClass.ImmuneSupport],
      routeTypes: [RouteType.Topical, RouteType.Internal],
      protocolRoles: ["primary", "adjuvant"],
      mechanismTags: ["carvacrol_activity", "membrane_disruption", "nf_kb_modulation"],
    },
    description:
      "Oregano (Origanum vulgare) is a potent antimicrobial oil high in carvacrol. Its strength requires careful dilution and professional guidance for internal use.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["zingiber_officinale", {
    oilId: "zingiber_officinale",
    commonName: "Ginger",
    latinName: "Zingiber officinale",
    plantFamily: "Zingiberaceae",
    chemicalConstituents: [
      { name: "Zingiberene", percentageRange: "25-35%", role: "Primary anti-nausea and anti-inflammatory" },
      { name: "Beta-sesquiphellandrene", percentageRange: "10-15%", role: "Anti-inflammatory support" },
      { name: "Bisabolene", percentageRange: "5-10%", role: "Anti-inflammatory" },
      { name: "Camphene", percentageRange: "5-10%", role: "Antioxidant" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Digestive,
      TherapeuticProperty.Analgesic,
      TherapeuticProperty.Antioxidant,
      TherapeuticProperty.CirculatoryStimulant,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic, ApplicationMethod.Internal],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 2,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: ["May cause skin sensitization at high concentrations", "Avoid during first trimester"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.DigestiveSupport,
      secondaryClasses: [RemedyClass.TopicalAntiInflammatory, RemedyClass.CirculatoryStimulant],
      routeTypes: [RouteType.All],
      protocolRoles: ["primary", "supportive"],
      mechanismTags: ["cox_inhibition", "5ht3_antagonism", "trpv1_agonist"],
    },
    description:
      "Ginger (Zingiber officinale) is a warming oil used for digestive support, anti-nausea protocols, and circulation enhancement.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["boswellia_sacra", {
    oilId: "boswellia_sacra",
    commonName: "Frankincense",
    latinName: "Boswellia sacra",
    plantFamily: "Burseraceae",
    chemicalConstituents: [
      { name: "Alpha-pinene", percentageRange: "40-65%", role: "Anti-inflammatory and bronchodilator" },
      { name: "Alpha-thujene", percentageRange: "5-15%", role: "Antimicrobial support" },
      { name: "Sabinene", percentageRange: "2-8%", role: "Antioxidant" },
      { name: "Beta-pinene", percentageRange: "2-8%", role: "Anti-inflammatory" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Grounding,
      TherapeuticProperty.Antioxidant,
      TherapeuticProperty.Immunostimulant,
      TherapeuticProperty.Vulnerary,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 5,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.GroundingEarthy,
      secondaryClasses: [RemedyClass.TopicalAntiInflammatory, RemedyClass.ImmuneSupport, RemedyClass.SkinCare],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["5_lox_inhibition", "nf_kb_modulation", "boswellic_acid_synergy"],
    },
    description:
      "Frankincense (Boswellia sacra) is revered for its grounding, anti-inflammatory, and skin-regenerating properties, often used in meditation and immune support protocols.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["citrus_limon", {
    oilId: "citrus_limon",
    commonName: "Lemon",
    latinName: "Citrus limon",
    plantFamily: "Rutaceae",
    chemicalConstituents: [
      { name: "Limonene", percentageRange: "60-80%", role: "Antioxidant, mood-uplifting, and antimicrobial" },
      { name: "Beta-pinene", percentageRange: "5-15%", role: "Anti-inflammatory support" },
      { name: "Gamma-terpinene", percentageRange: "3-10%", role: "Antioxidant" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Uplifting,
      TherapeuticProperty.Antioxidant,
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.Digestive,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic, ApplicationMethod.Internal],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 2,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: true,
      contraindications: ["Photosensitizing — avoid sun exposure within 12 hours of topical application"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AromaticStimulant,
      secondaryClasses: [RemedyClass.DigestiveSupport],
      routeTypes: [RouteType.All],
      protocolRoles: ["primary", "supportive", "adjuvant"],
      mechanismTags: ["limonene_activity", "ros_scavenging"],
    },
    description:
      "Lemon (Citrus limon) is a bright, uplifting citrus oil with strong antioxidant and mood-enhancing properties. Photosensitizing when applied topically.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["citrus_bergamia", {
    oilId: "citrus_bergamia",
    commonName: "Bergamot",
    latinName: "Citrus bergamia",
    plantFamily: "Rutaceae",
    chemicalConstituents: [
      { name: "Limonene", percentageRange: "27-45%", role: "Antioxidant and mood support" },
      { name: "Linalyl acetate", percentageRange: "18-35%", role: "Calming and antispasmodic" },
      { name: "Linalool", percentageRange: "5-15%", role: "Calming and analgesic" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Uplifting,
      TherapeuticProperty.Calming,
      TherapeuticProperty.Antispasmodic,
      TherapeuticProperty.Antimicrobial,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 1,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: true,
      contraindications: [
        "Photosensitizing — avoid sun exposure within 12–18 hours of topical application",
        "Use FCF (furanocoumarin-free) bergamot for topical protocols",
      ],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AromaticRelaxant,
      secondaryClasses: [RemedyClass.AromaticStimulant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["gaba_modulation", "serotonin_modulation"],
    },
    description:
      "Bergamot (Citrus bergamia) bridges calming and uplifting properties, making it a versatile mood-balancing oil. Photosensitizing; use FCF variant for topical applications.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["rosa_damascena", {
    oilId: "rosa_damascena",
    commonName: "Rose",
    latinName: "Rosa damascena",
    plantFamily: "Rosaceae",
    chemicalConstituents: [
      { name: "Citronellol", percentageRange: "20-40%", role: "Primary antimicrobial and calming" },
      { name: "Geraniol", percentageRange: "10-25%", role: "Antimicrobial and skin-healing" },
      { name: "Nerol", percentageRange: "5-15%", role: "Calming and antispasmodic" },
      { name: "Rose oxide", percentageRange: "0.02-2%", role: "Key aromatic compound" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Calming,
      TherapeuticProperty.Uplifting,
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.Cicatrisant,
      TherapeuticProperty.HormonalSupport,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 3,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.HormonalSupport,
      secondaryClasses: [RemedyClass.SkinCare, RemedyClass.AromaticRelaxant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive"],
      mechanismTags: ["estrogen_modulation", "serotonin_modulation", "wound_healing"],
    },
    description:
      "Rose (Rosa damascena) is a precious, emotionally supportive oil with hormonal balancing and skin-regenerating properties.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["chamomilla_recutita", {
    oilId: "chamomilla_recutita",
    commonName: "German Chamomile",
    latinName: "Matricaria chamomilla",
    plantFamily: "Asteraceae",
    chemicalConstituents: [
      { name: "Alpha-bisabolol", percentageRange: "10-25%", role: "Anti-inflammatory and wound healing" },
      { name: "Chamazulene", percentageRange: "2-15%", role: "Potent anti-inflammatory (formed during distillation)" },
      { name: "Beta-farnesene", percentageRange: "10-20%", role: "Antispasmodic support" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Calming,
      TherapeuticProperty.Vulnerary,
      TherapeuticProperty.Antispasmodic,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 3,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: ["Avoid if allergic to plants in the Asteraceae family"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.TopicalAntiInflammatory,
      secondaryClasses: [RemedyClass.AromaticRelaxant, RemedyClass.SkinCare],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "adjuvant"],
      mechanismTags: ["cox_inhibition", "5_lox_inhibition", "bisabolol_activity"],
    },
    description:
      "German Chamomile (Matricaria chamomilla) is distinguished by its vivid blue chamazulene content, making it one of the most potent topical anti-inflammatory essential oils.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["cymbopogon_flexuosus", {
    oilId: "cymbopogon_flexuosus",
    commonName: "Lemongrass",
    latinName: "Cymbopogon flexuosus",
    plantFamily: "Poaceae",
    chemicalConstituents: [
      { name: "Citral (neral + geranial)", percentageRange: "65-85%", role: "Primary antimicrobial and antifungal" },
      { name: "Limonene", percentageRange: "2-8%", role: "Antioxidant" },
      { name: "Geraniol", percentageRange: "1-5%", role: "Antimicrobial synergist" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.Antifungal,
      TherapeuticProperty.Uplifting,
      TherapeuticProperty.AntiInflammatory,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 1,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: ["May cause skin sensitization — always dilute well", "Avoid on sensitive or damaged skin"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AntimicrobialBroad,
      secondaryClasses: [RemedyClass.AromaticStimulant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "adjuvant"],
      mechanismTags: ["citral_activity", "membrane_disruption"],
    },
    description:
      "Lemongrass (Cymbopogon flexuosus) is a powerful antimicrobial and mood-lifting oil, dominated by citral, used for infections, pain, and mental fatigue.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["santalum_album", {
    oilId: "santalum_album",
    commonName: "Sandalwood",
    latinName: "Santalum album",
    plantFamily: "Santalaceae",
    chemicalConstituents: [
      { name: "Alpha-santalol", percentageRange: "40-55%", role: "Primary grounding, anti-inflammatory, and skin-healing" },
      { name: "Beta-santalol", percentageRange: "15-25%", role: "Grounding and spasmolytic" },
      { name: "Santalene", percentageRange: "5-10%", role: "Aromatic character" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Grounding,
      TherapeuticProperty.Calming,
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Cicatrisant,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 5,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.GroundingEarthy,
      secondaryClasses: [RemedyClass.SkinCare, RemedyClass.AromaticRelaxant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["santalol_activity", "nervous_system_grounding"],
    },
    description:
      "Sandalwood (Santalum album) is a deeply grounding and meditative oil prized for skin healing and nervous system support.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["cinnamomum_verum", {
    oilId: "cinnamomum_verum",
    commonName: "Cinnamon Bark",
    latinName: "Cinnamomum verum",
    plantFamily: "Lauraceae",
    chemicalConstituents: [
      { name: "Trans-cinnamaldehyde", percentageRange: "55-75%", role: "Potent antimicrobial and warming" },
      { name: "Eugenol", percentageRange: "1-10%", role: "Analgesic and anti-inflammatory" },
      { name: "Linalool", percentageRange: "1-5%", role: "Mild calming support" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.Antifungal,
      TherapeuticProperty.Analgesic,
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.CirculatoryStimulant,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.High,
      maxDilutionPercent: 0.5,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: [
        "Highly irritating to mucous membranes — very low dilution required",
        "Not for use during pregnancy",
        "Not for children",
        "May cause skin sensitization and burns at concentrations above 0.5%",
      ],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AntimicrobialBroad,
      secondaryClasses: [RemedyClass.CirculatoryStimulant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["adjuvant", "synergist"],
      mechanismTags: ["cinnamaldehyde_activity", "membrane_disruption"],
    },
    description:
      "Cinnamon Bark (Cinnamomum verum) is a potent warming antimicrobial. Its high cinnamaldehyde content demands very careful dilution — for experienced users only.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["pelargonium_graveolens", {
    oilId: "pelargonium_graveolens",
    commonName: "Geranium",
    latinName: "Pelargonium graveolens",
    plantFamily: "Geraniaceae",
    chemicalConstituents: [
      { name: "Citronellol", percentageRange: "20-40%", role: "Antimicrobial and balancing" },
      { name: "Geraniol", percentageRange: "10-20%", role: "Antimicrobial and skin-healing" },
      { name: "Linalool", percentageRange: "3-10%", role: "Mild calming support" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.HormonalSupport,
      TherapeuticProperty.Antimicrobial,
      TherapeuticProperty.Calming,
      TherapeuticProperty.Cicatrisant,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 3,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.HormonalSupport,
      secondaryClasses: [RemedyClass.SkinCare, RemedyClass.AromaticRelaxant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["estrogen_modulation", "geraniol_activity"],
    },
    description:
      "Geranium (Pelargonium graveolens) is a hormone-balancing, skin-healing oil used for mood regulation, menstrual support, and skin care protocols.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["vetiveria_zizanioides", {
    oilId: "vetiveria_zizanioides",
    commonName: "Vetiver",
    latinName: "Chrysopogon zizanioides",
    plantFamily: "Poaceae",
    chemicalConstituents: [
      { name: "Khusimol", percentageRange: "5-15%", role: "Grounding and sedative" },
      { name: "Isovalencenol", percentageRange: "5-10%", role: "Sedative support" },
      { name: "Vetivene", percentageRange: "5-10%", role: "Aromatic character and grounding" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Grounding,
      TherapeuticProperty.Calming,
      TherapeuticProperty.Nervine,
      TherapeuticProperty.Adaptogenic,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 5,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.GroundingEarthy,
      secondaryClasses: [RemedyClass.AromaticRelaxant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["nervous_system_grounding", "gaba_modulation"],
    },
    description:
      "Vetiver (Chrysopogon zizanioides) is a deeply earthy, grounding oil revered for its nervine and adaptogenic properties, ideal for anxiety and sleep protocols.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["cedrus_atlantica", {
    oilId: "cedrus_atlantica",
    commonName: "Cedarwood Atlas",
    latinName: "Cedrus atlantica",
    plantFamily: "Pinaceae",
    chemicalConstituents: [
      { name: "Beta-himachalene", percentageRange: "25-40%", role: "Primary sedative and grounding" },
      { name: "Alpha-himachalene", percentageRange: "10-20%", role: "Sedative support" },
      { name: "Atlantone", percentageRange: "5-10%", role: "Aromatic and mucolytic" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Grounding,
      TherapeuticProperty.Calming,
      TherapeuticProperty.Expectorant,
      TherapeuticProperty.Diuretic,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 5,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.GroundingEarthy,
      secondaryClasses: [RemedyClass.RespiratorySupport, RemedyClass.AromaticRelaxant],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["nervous_system_grounding", "mucolytic"],
    },
    description:
      "Cedarwood Atlas (Cedrus atlantica) delivers a warm, woody grounding quality used for focus, sleep support, and respiratory protocols.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["juniperus_communis", {
    oilId: "juniperus_communis",
    commonName: "Juniper Berry",
    latinName: "Juniperus communis",
    plantFamily: "Cupressaceae",
    chemicalConstituents: [
      { name: "Alpha-pinene", percentageRange: "30-50%", role: "Anti-inflammatory and diuretic" },
      { name: "Myrcene", percentageRange: "5-15%", role: "Analgesic and anti-inflammatory" },
      { name: "Sabinene", percentageRange: "5-15%", role: "Antioxidant support" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Diuretic,
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Analgesic,
      TherapeuticProperty.Antimicrobial,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 3,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: ["Avoid with kidney disease", "Not for use during pregnancy"],
    },
    ontologyTags: {
      remedyClass: RemedyClass.DigestiveSupport,
      secondaryClasses: [RemedyClass.TopicalAntiInflammatory],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "adjuvant"],
      mechanismTags: ["diuretic_activity", "cox_inhibition"],
    },
    description:
      "Juniper Berry (Juniperus communis) is a cleansing and detoxifying oil used for diuretic, anti-inflammatory, and lymphatic support protocols.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["pogostemon_cablin", {
    oilId: "pogostemon_cablin",
    commonName: "Patchouli",
    latinName: "Pogostemon cablin",
    plantFamily: "Lamiaceae",
    chemicalConstituents: [
      { name: "Patchoulol", percentageRange: "25-40%", role: "Primary grounding and anti-inflammatory" },
      { name: "Alpha-bulnesene", percentageRange: "15-20%", role: "Anti-inflammatory" },
      { name: "Alpha-guaiene", percentageRange: "10-15%", role: "Antioxidant" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Grounding,
      TherapeuticProperty.AntiInflammatory,
      TherapeuticProperty.Antifungal,
      TherapeuticProperty.Cicatrisant,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Low,
      maxDilutionPercent: 5,
      safeInPregnancy: false,
      safeForChildren: true,
      photosensitizing: false,
      contraindications: [],
    },
    ontologyTags: {
      remedyClass: RemedyClass.GroundingEarthy,
      secondaryClasses: [RemedyClass.SkinCare, RemedyClass.TopicalAntiInflammatory],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["patchoulol_activity", "nervous_system_grounding"],
    },
    description:
      "Patchouli (Pogostemon cablin) is a rich, earthy grounding oil used for skin regeneration, anxiety, and anti-inflammatory protocols.",
    lastReviewedAt: "2026-04-10",
  }],

  // -------------------------------------------------------------------------
  ["cananga_odorata", {
    oilId: "cananga_odorata",
    commonName: "Ylang Ylang",
    latinName: "Cananga odorata",
    plantFamily: "Annonaceae",
    chemicalConstituents: [
      { name: "Germacrene-D", percentageRange: "15-25%", role: "Anti-inflammatory and calming" },
      { name: "Beta-caryophyllene", percentageRange: "5-15%", role: "CB2 receptor agonist, anti-inflammatory" },
      { name: "Linalool", percentageRange: "5-15%", role: "Calming and antispasmodic" },
      { name: "Benzyl acetate", percentageRange: "5-15%", role: "Relaxing and antispasmodic ester" },
    ],
    therapeuticProperties: [
      TherapeuticProperty.Calming,
      TherapeuticProperty.Uplifting,
      TherapeuticProperty.HormonalSupport,
      TherapeuticProperty.Antispasmodic,
    ],
    applicationMethods: [ApplicationMethod.Topical, ApplicationMethod.Aromatic],
    safetyProfile: {
      tier: SafetyTier.Moderate,
      maxDilutionPercent: 1,
      safeInPregnancy: false,
      safeForChildren: false,
      photosensitizing: false,
      contraindications: [
        "May cause headaches or nausea when used in high concentration aromatically",
        "Potential skin sensitizer — dilute carefully",
      ],
    },
    ontologyTags: {
      remedyClass: RemedyClass.AromaticRelaxant,
      secondaryClasses: [RemedyClass.HormonalSupport],
      routeTypes: [RouteType.Topical_Aromatic],
      protocolRoles: ["primary", "supportive", "synergist"],
      mechanismTags: ["serotonin_modulation", "nervous_system_sedation"],
    },
    description:
      "Ylang Ylang (Cananga odorata) is an intensely floral, calming oil used for stress, mood elevation, and hormonal balance protocols. Use in moderation.",
    lastReviewedAt: "2026-04-10",
  }],
]);

// ---------------------------------------------------------------------------
// Public accessor functions
// ---------------------------------------------------------------------------

/**
 * Retrieve a single oil by its canonical OilId.
 * Returns undefined if the oilId is not in the registry.
 *
 * Individual property lookups are permitted for display purposes (M-005).
 */
export function getOilById(id: OilId): Oil | undefined {
  return OILS_REGISTRY.get(id);
}

/**
 * Retrieve all oils in the registry as an array.
 *
 * NOTE: The full registry must not be exposed through external-facing API
 * endpoints (M-005 — Proprietary Oil Ontology).
 */
export function getAllOils(): Oil[] {
  return Array.from(OILS_REGISTRY.values());
}

/**
 * Retrieve all oils that belong to a specific remedy class
 * (primary class match only).
 */
export function getOilsByRemedyClass(remedyClass: string): Oil[] {
  return getAllOils().filter((oil) => oil.ontologyTags.remedyClass === remedyClass);
}

/**
 * Retrieve all oils that support a specific application method.
 */
export function getOilsByApplicationMethod(method: ApplicationMethod): Oil[] {
  return getAllOils().filter((oil) => oil.applicationMethods.includes(method));
}

/**
 * Returns true if the given string is a registered canonical OilId.
 */
export function isRegisteredOilId(id: string): id is OilId {
  return OILS_REGISTRY.has(id as OilId);
}

/** The total number of oils in the registry. */
export function getOilCount(): number {
  return OILS_REGISTRY.size;
}
