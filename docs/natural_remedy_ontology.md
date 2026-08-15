# natural_remedy_ontology.md — Natural Remedy Ontology Specification

## Purpose

This document specifies the Natural Remedy Ontology for the Phyto.ai platform: the classification taxonomy, property encodings, and relationship structure used to organize essential oils and botanical remedies. The ontology underpins oil search, protocol generation, blend recommendations, and ontology-aware substitution.

The full relational ontology graph is a moat-protected asset (M-005, LOCK-002). This document defines the public schema and classification framework. The proprietary relationship weights and therapeutic synergy graph remain internal.

---

## Scope

The Natural Remedy Ontology covers:

1. **Oil classification** — how oils are categorized by remedy class, therapeutic property, and route.
2. **Chemical constituent taxonomy** — primary active compounds and their therapeutic associations.
3. **Safety classification** — tiered safety model for application guidance.
4. **Ontology tags** — the public classification labels attached to `Oil` entities.
5. **Substitution rules** — when one oil may substitute for another within a protocol.
6. **Extension points** — how new oils and remedy classes are added.

The ontology does **not** govern:
- Synergy scoring between oil combinations (owned by Blend Intelligence layer, M-001).
- Protocol generation logic (M-002).
- Individual user allergy or sensitivity matching (owned by User Profile layer).

---

## Ontology Structure

### Level 1: Remedy Class

The top-level classification node. Each oil belongs to exactly one primary `RemedyClass`. Defined in `src/ontology/types.ts`.

| Remedy Class | Description | Example Oils |
|---|---|---|
| `aromatic_relaxant` | Calming, stress-reducing aromatic oils | Lavender, Roman Chamomile, Ylang Ylang |
| `aromatic_stimulant` | Energizing, focus-enhancing aromatic oils | Peppermint, Rosemary, Lemon |
| `topical_anti_inflammatory` | Anti-inflammatory agents for topical use | Helichrysum, Copaiba, German Chamomile |
| `topical_analgesic` | Pain-relief agents for topical use | Peppermint, Wintergreen, Clove |
| `immune_support` | Immune-modulating oils | Tea Tree, Oregano, On Guard blend base |
| `respiratory_support` | Respiratory and airway support | Eucalyptus, Breathe blend base, Cardamom |
| `digestive_support` | GI tract support and motility | Ginger, DigestZen blend base, Fennel |
| `hormonal_support` | Endocrine and hormonal regulation support | Clary Sage, Geranium, Thyme |
| `skin_care` | Skin regeneration, soothing, and protection | Frankincense, Helichrysum, Lavender |
| `antimicrobial_broad` | Broad-spectrum antimicrobial activity | Tea Tree, Oregano, Clove, Thyme |
| `grounding_earthy` | Grounding, centering, emotional support | Vetiver, Cedarwood, Sandalwood, Patchouli |
| `circulatory_stimulant` | Circulation and lymphatic support | Cypress, Black Pepper, Ginger |

An oil may have a secondary remedy class used for substitution logic (see Section: Substitution Rules).

---

### Level 2: Therapeutic Properties

Each oil carries an array of `TherapeuticProperty` values (defined in `src/ontology/types.ts`). These are additive — an oil may have many therapeutic properties.

| Property | Description |
|----------|-------------|
| `calming` | Reduces anxiety, nervous system tension |
| `energizing` | Increases alertness and vitality |
| `grounding` | Promotes emotional stability and presence |
| `uplifting` | Elevates mood, combats low affect |
| `anti-inflammatory` | Reduces systemic or local inflammation |
| `antimicrobial` | Inhibits bacterial, fungal, or viral growth |
| `antioxidant` | Neutralizes oxidative stress |
| `analgesic` | Reduces pain perception |
| `adaptogenic` | Supports stress resilience and homeostasis |
| `immunostimulant` | Activates or enhances immune response |
| `expectorant` | Loosens and expels respiratory mucus |
| `antispasmodic` | Reduces muscle spasm and cramping |
| `digestive` | Supports digestion and GI comfort |
| `diuretic` | Promotes fluid elimination |
| `antifungal` | Inhibits fungal growth specifically |
| `antiviral` | Inhibits viral replication |
| `cicatrisant` | Promotes scar tissue healing and skin regeneration |
| `vulnerary` | Promotes wound healing |
| `nervine` | Supports and tones the nervous system |
| `rubefacient` | Increases local circulation via skin warming |
| `circulatory_stimulant` | Promotes systemic circulation |
| `hormonal_support` | Modulates hormonal pathways |
| `sedative` | Promotes sleep onset and depth |

---

### Level 3: Chemical Constituents

The `chemical_constituents` field on each Oil entity records the primary active compounds. These drive the moat-protected synergy scoring and substitution logic.

**Key constituent families (public classification):**

| Family | Example Compounds | Associated Effects |
|--------|------------------|--------------------|
| Monoterpenes | Limonene, Alpha-pinene, Beta-pinene | Cleansing, energizing, air purifying |
| Sesquiterpenes | Beta-caryophyllene, Zingiberene | Anti-inflammatory, grounding |
| Monoterpenols | Linalool, Geraniol, Citronellol | Calming, antimicrobial, skin-safe |
| Phenols | Thymol, Carvacrol, Eugenol | Potent antimicrobial (use with caution) |
| Oxides | 1,8-Cineole (Eucalyptol) | Expectorant, respiratory |
| Esters | Linalyl acetate, Geranyl acetate | Calming, antispasmodic |
| Aldehydes | Citral, Citronellal | Antimicrobial, lemon-like aroma |
| Ketones | Camphor, Menthone, Pulegone | Mucolytic, analgesic (requires caution) |
| Ethers | Methyl chavicol, Trans-anethole | Digestive, antispasmodic |

The precise compound-to-effect mappings used in scoring are moat-protected (M-001, M-005).

---

### Level 4: Safety Classification

Each oil is assigned a `SafetyTier` governing application guidance:

| Tier | Value | Description | Default Dilution |
|------|-------|-------------|-----------------|
| 1 | `generally_safe` | Safe for topical diluted use; aromatic undiluted | 2–3% for adults |
| 2 | `dilute_required` | Must be diluted; not for sensitive populations undiluted | 3–5% maximum |
| 3 | `use_with_caution` | Known sensitizers or potent actives; professional guidance recommended | 0.5–1% |
| 4 | `contraindicated_groups` | Contraindicated for specific populations (pregnant, children, medications) | Consult practitioner |
| 5 | `internal_only_professional` | Internal use requires professional supervision | Professional use only |

---

### Level 5: Ontology Tags

`OntologyTags` (defined in `src/ontology/types.ts`) are the structured classification labels attached to each `Oil` entity. They expose a subset of the ontology to consumers without revealing the full relational graph.

```typescript
interface OntologyTags {
  remedyClass: RemedyClass;           // Primary classification
  secondaryClass?: RemedyClass;        // Optional secondary class (for substitution)
  therapeuticProperties: TherapeuticProperty[];
  routeTypes: RouteType[];
  safetyTier: SafetyTier;
  constituentFamilies: string[];       // Constituent family names (not weights)
}
```

---

## Substitution Rules

Ontology-aware substitution allows the protocol engine to suggest alternative oils when a recommended oil is unavailable or contraindicated for a specific user.

### Rule ONT-001: Primary Class Substitution

An oil may substitute for another if both share the same primary `RemedyClass` AND at least two overlapping `TherapeuticProperty` values.

### Rule ONT-002: Safety Tier Gate

A substitute oil must have a `SafetyTier` equal to or lower (safer) than the original. No substitution may introduce a higher safety tier.

### Rule ONT-003: Route Compatibility

A substitute oil must support all `RouteType` values required by the protocol step. A topical-only oil cannot substitute for an aromatic oil in an aromatic protocol step.

### Rule ONT-004: Sensitivity Filter

Substitution candidates are filtered against the `User Profile.sensitivities` array. Any oil listed in sensitivities is excluded as a candidate regardless of class match.

### Rule ONT-005: Synergy Score Preservation (Moat-Protected)

The final substitution ranking within a valid candidate set is governed by the moat-protected synergy scoring model (M-001). The above rules define eligibility; ranking is proprietary.

---

## Oil Registry

The canonical oil registry is defined in `src/ontology/oils.ts` and currently contains **20 seed oils**. Each entry conforms to the `Oil` type defined in `src/ontology/types.ts`.

### Adding a New Oil

To add an oil to the registry:

1. Verify the oil is not already present (check by `oil_id` and `latin_name`).
2. Assign all required `OntologyTags` fields.
3. Assign `chemical_constituents` with at least one entry.
4. Assign `safety_notes` with dilution requirements and contraindications.
5. Add to `src/ontology/oils.ts` registry.
6. Run `validateOilRegistry()` — must pass all 115 ontology integrity tests.
7. If a new `RemedyClass` is introduced, add it to `src/ontology/types.ts → RemedyClass` enum and update this document.

### Adding a New Remedy Class

1. Propose the new class in an ADR (this extends the ontology schema — architecture impact).
2. Add the enum value to `RemedyClass` in `src/ontology/types.ts`.
3. Update the classification table in this document.
4. Update affected oils in the registry with the new class if applicable.

---

## Moat Boundary Summary

| Component | Public? | Notes |
|-----------|---------|-------|
| Oil entity type and OntologyTags structure | ✅ | Exposed in `src/ontology/types.ts` |
| RemedyClass, TherapeuticProperty, SafetyTier enums | ✅ | Exposed in `src/ontology/types.ts` |
| Oil registry (20 seed oils) | ✅ | Exposed in `src/ontology/oils.ts` |
| Substitution eligibility rules (ONT-001 through ONT-004) | ✅ | Documented above |
| Full relational ontology graph and relationship weights | ❌ | M-005 |
| Synergy scoring model and constituent interaction matrix | ❌ | M-001 |
| Substitution ranking algorithm (ONT-005) | ❌ | M-001, M-005 |

---

## References

- Domain entity: `docs/DOMAIN_MODEL.md` → Oil, User Profile
- Moat protection: `docs/MOAT_MODEL.md` → M-001, M-005
- Architecture lock: `docs/ARCHITECTURE_LOCK.md` → LOCK-001, LOCK-002
- Source module: `src/ontology/`
