# natural_remedy_ontology.md — Natural Remedy Ontology Specification

## Purpose

This document defines the classification taxonomy, semantic structure, and property encodings for natural remedies — primarily essential oils — within the Phyto.ai protocol intelligence platform. The ontology underpins protocol generation, blend intelligence, remedy search, and AI reasoning.

**Moat boundary**: The full ontology graph and relational structure are protected per M-005 in `docs/MOAT_MODEL.md`. Public interfaces may return individual oil properties but not the relational graph.

---

## Ontology Design Principles

1. **Hierarchical with lateral links**: Oils are classified hierarchically by botanical family, but therapeutic relationships cross those hierarchies.
2. **Property-first**: Every classification node carries structured properties, not just labels.
3. **Protocol-ready**: Ontology tags must be directly usable by the protocol generation engine for routing and substitution.
4. **Evolution-safe**: The ontology can be extended (new tags, new links) without modifying locked domain entity definitions.

---

## Taxonomy Structure

### Level 1 — Remedy Class

Top-level classification of the remedy type.

| Class | Description |
|-------|-------------|
| `essential_oil` | Volatile aromatic compounds extracted from plant material |
| `carrier_oil` | Fixed (non-volatile) plant oils used for dilution and topical application |
| `hydrosol` | Aqueous distillate co-produced with essential oil extraction |
| `botanical_extract` | Standardized plant extracts not classified as essential oils |
| `blend_base` | Pre-formulated blending bases (e.g., fractionated coconut oil) |

---

### Level 2 — Botanical Family

Taxonomic grouping by plant family, informing chemical profile predictions.

| Family | Examples |
|--------|---------|
| `lamiaceae` | Lavender, Peppermint, Rosemary, Basil, Thyme |
| `rutaceae` | Lemon, Orange, Bergamot, Lime, Grapefruit |
| `apiaceae` | Fennel, Carrot Seed, Coriander |
| `myrtaceae` | Eucalyptus, Tea Tree, Clove, Myrtle |
| `pinaceae` | Cedarwood, Fir, Pine, Spruce |
| `burseraceae` | Frankincense, Myrrh |
| `poaceae` | Lemongrass, Vetiver, Palmarosa |
| `geraniaceae` | Geranium |
| `valerianaceae` | Spikenard, Valerian |
| `other` | Oils not fitting standard family groupings |

---

### Level 3 — Chemical Constituent Profile

The dominant chemical constituent classes that determine therapeutic properties and blending compatibility.

| Constituent Class | Therapeutic Character | Blending Notes |
|------------------|-----------------------|----------------|
| `monoterpenes` | Energizing, cleansing, antiseptic | Top notes; evaporate quickly |
| `sesquiterpenes` | Grounding, anti-inflammatory, calming | Base notes; long-lasting |
| `monoterpenols` | Balancing, immune-supportive, gentle | Middle notes; well-tolerated |
| `phenols` | Powerful antimicrobial; warming | Use with caution; skin sensitization risk |
| `aldehydes` | Calming, anti-inflammatory | Skin sensitization risk at high concentrations |
| `ketones` | Mucolytic, wound-healing | Use with caution; neurotoxic at high dose |
| `esters` | Relaxing, antispasmodic, balancing | Generally safe; pleasant aroma |
| `oxides` | Expectorant, decongestant, stimulating | Note: 1,8-cineole is the primary oxide class |
| `ethers` | Antispasmodic, relaxing | Use with caution |

---

### Level 4 — Therapeutic Property Tags

Structured tags used for protocol routing and blend intelligence.

#### Therapeutic Domain Tags

| Tag | Description |
|-----|-------------|
| `calming` | Reduces anxiety, nervous tension |
| `energizing` | Increases alertness and energy |
| `grounding` | Promotes emotional stability and rootedness |
| `uplifting` | Improves mood, counteracts sadness |
| `clarifying` | Supports mental focus and cognitive clarity |
| `balancing` | Harmonizes emotional or physical systems |
| `purifying` | Cleansing action on air, surfaces, or body |

#### System-Specific Tags

| Tag | System Targeted |
|-----|----------------|
| `respiratory` | Airways, lungs |
| `immune_support` | Immune system activation or modulation |
| `digestive` | GI tract, digestion |
| `musculoskeletal` | Muscles, joints, connective tissue |
| `integumentary` | Skin, hair, nails |
| `nervous_system` | Neurological and mood regulation |
| `endocrine_support` | Hormonal balance support |
| `cardiovascular` | Circulation, blood pressure |
| `lymphatic` | Lymph flow and drainage |
| `sleep` | Sleep quality and onset |

#### Safety Tags

| Tag | Meaning |
|-----|---------|
| `photosensitive` | May cause skin reactions under UV exposure |
| `skin_sensitizing` | Risk of sensitization with repeated use |
| `dilution_required` | Must be diluted before topical use |
| `internal_use_caution` | Internal use requires professional guidance |
| `pregnancy_contraindicated` | Avoid during pregnancy |
| `child_use_restricted` | Not suitable for children under a specified age |
| `drug_interaction_risk` | Possible interaction with pharmaceutical agents |
| `epilepsy_contraindicated` | Avoid with epilepsy or seizure history |

---

### Level 5 — Application Method Tags

| Tag | Description |
|-----|-------------|
| `aromatic` | Diffusion, inhalation |
| `topical` | Direct application to skin (diluted) |
| `internal` | Ingestion (requires therapeutic grade and guidance) |
| `environmental` | Surface cleaning, air purification |

---

## Protocol Role Taxonomy

How an oil functions within a protocol blend or phase.

| Protocol Role | Description |
|--------------|-------------|
| `primary` | The featured therapeutic agent for the protocol's goal |
| `synergist` | Amplifies the action of the primary oil |
| `modifier` | Adjusts or softens the profile (e.g., adds sweetness, buffers harshness) |
| `carrier` | Dilution vehicle (carrier oils only) |
| `safety_buffer` | Added to offset sensitization risk from other blend members |

---

## Ontology Tag Format

All `ontology_tags` on the `Oil` entity (defined in `docs/DOMAIN_MODEL.md`) must conform to this structure:

```json
{
  "remedy_class": "essential_oil",
  "botanical_family": "lamiaceae",
  "dominant_constituents": ["esters", "monoterpenols"],
  "therapeutic_tags": ["calming", "sleep", "nervous_system", "integumentary"],
  "safety_tags": ["dilution_required"],
  "application_methods": ["aromatic", "topical"],
  "protocol_roles": ["primary", "synergist"]
}
```

---

## Ontology Governance Rules

1. New tags may be added to any level by appending to the relevant table in this document with an ADR entry if the addition changes the domain model interface.
2. Existing tags must not be renamed or removed without an ADR (LOCK-001 applies to entity fields that reference ontology tags).
3. The full relational graph (cross-oil therapeutic relationship links) is maintained internally and is moat-protected (M-005).
4. All ontology changes must be reflected in `docs/ARCHITECTURE_INDEX.md` if new files are added.

---

## V1 Essential Oil Reference Set

The following oils constitute the V1 reference set for protocol generation and simulation. Each must have a complete `ontology_tags` record before the protocol engine may reference it.

| Common Name | Latin Name | Botanical Family | Primary Therapeutic Tags |
|-------------|-----------|-----------------|--------------------------|
| Lavender | *Lavandula angustifolia* | lamiaceae | calming, sleep, nervous_system, integumentary |
| Peppermint | *Mentha × piperita* | lamiaceae | energizing, respiratory, digestive, clarifying |
| Frankincense | *Boswellia carterii* | burseraceae | grounding, immune_support, integumentary, nervous_system |
| Lemon | *Citrus limon* | rutaceae | uplifting, purifying, clarifying, immune_support |
| Tea Tree | *Melaleuca alternifolia* | myrtaceae | purifying, immune_support, integumentary |
| Eucalyptus | *Eucalyptus radiata* | myrtaceae | respiratory, energizing, purifying |
| Bergamot | *Citrus bergamia* | rutaceae | uplifting, calming, nervous_system |
| Cedarwood | *Cedrus atlantica* | pinaceae | grounding, sleep, nervous_system |
| Wild Orange | *Citrus sinensis* | rutaceae | uplifting, energizing, digestive |
| Rosemary | *Salvia rosmarinus* | lamiaceae | clarifying, energizing, musculoskeletal |
| Geranium | *Pelargonium graveolens* | geraniaceae | balancing, endocrine_support, integumentary |
| Ylang Ylang | *Cananga odorata* | annonaceae | calming, uplifting, cardiovascular |
| Clove | *Syzygium aromaticum* | myrtaceae | immune_support, musculoskeletal, purifying |
| Ginger | *Zingiber officinale* | zingiberaceae | digestive, energizing, musculoskeletal |
| Vetiver | *Vetiveria zizanioides* | poaceae | grounding, sleep, nervous_system |
