# Phyto.ai — Complete System Architecture Diagram

This document shows how the major platform systems connect.

## High-Level Architecture

```mermaid
flowchart TD
    A[Landing Site<br/>phyto.ai] --> B[App / PWA<br/>app.phyto.ai]
    A --> C[Shopify Store<br/>store.phyto.ai]

    B --> D[Authentication / Identity]
    B --> E[Symptom Engine]
    B --> F[Challenge Engine]
    B --> G[Protocol Engine]
    B --> H[Discovery Feed]
    B --> I[Contributor Dashboard]
    B --> J[Founder Dashboard]
    B --> K[Feedback System]
    B --> L[Social Layer / Challenge Rooms]
    B --> M[Scanner / Inventory]
    B --> N[Geospatial Consent + Region Capture]

    E --> G
    F --> G
    M --> G
    N --> O[Geospatial Data Layer]

    G --> P[Protocol DSL]
    G --> Q[Protocol Library]
    G --> R[Natural Remedy Ontology]
    G --> S[Contributor Archetype Engine]
    G --> T[Protocol Instruction Layer]

    T --> U[Protocol Timer]
    U --> V[Daily Health Signal]
    U --> W[Lifestyle Signals]
    U --> X[Outcome Reporting]

    V --> Y[Relational Database]
    W --> Y
    X --> Y
    F --> Y
    K --> Y
    O --> Y

    G --> Z[Knowledge Graph]
    R --> Z
    S --> Z
    F --> Z
    O --> Z

    Y --> AA[Protocol Scoring System]
    Z --> AA
    AA --> AB[Protocol Evolution System]
    AB --> G

    Y --> AC[AI Pattern Detection]
    Z --> AC
    AC --> H
    AC --> I
    AC --> J
    AC --> AD[Research Insight Generator]

    C --> AE[Commerce / Bundle Mapping]
    G --> AE
    AE --> C

    AF[Synthetic Data & Simulation Layer] --> Y
    AF --> Z
    AF --> J
    AF --> AG[Integrity Validation]

    AH[Security & Compliance Layer] --> D
    AH --> Y
    AH --> Z
    AH --> J
    AH --> K
    AH --> O
```

---

## Data & Intelligence Flow

```mermaid
flowchart LR
    A[Contributor selects symptom] --> B[Protocol Generation Engine]
    B --> C[Protocol Instructions]
    C --> D[Protocol Timer / Challenge]
    D --> E[Daily Signals + Outcomes]
    E --> F[Relational DB]
    E --> G[Knowledge Graph]
    F --> H[Protocol Scoring]
    G --> H
    H --> I[Protocol Evolution]
    I --> B
    F --> J[AI Pattern Detection]
    G --> J
    J --> K[Discovery Feed / Insights]
```

---

## Privacy & Integrity Flow

```mermaid
flowchart TD
    A[User data submitted] --> B{data_origin}
    B -->|real_contributor| C[Eligible for production insight pipelines]
    B -->|synthetic| D[Excluded from production insights]
    B -->|internal_test| D
    C --> E[Anonymization / aggregation]
    E --> F[Discovery summaries / reports]
    A --> G[Geospatial capture]
    G --> H[Convert to coarse region / grid cell]
    H --> I[Discard raw coordinates]
    I --> J[Store anonymized region data]
```

---

## Social & Feedback Flow

```mermaid
flowchart LR
    A[Contributor joins challenge] --> B[Challenge Room]
    B --> C[Questions / tips / discussion]
    C --> D[Moderation + reputation signals]
    D --> E[Feedback System]
    E --> F[Product roadmap]
    D --> G[Contributor Reputation System]
```

---

## Founder Dashboard Data Sources

The Founder / Operator Dashboard should pull from:
- contributor acquisition metrics
- challenge participation
- protocol runs
- outcome reports
- adherence rates
- discovery insight generation
- geospatial summaries
- revenue metrics
- feedback volume / feature requests
- reputation distribution
- synthetic data exclusion validation