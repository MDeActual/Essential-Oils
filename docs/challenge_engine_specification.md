# challenge_engine_specification.md — Challenge Engine Specification

## Purpose

This document specifies the design, rule system, and behavioral logic of the Phyto.ai Challenge Engine. Challenges are first-class protocol components that drive contributor adherence, generate cleaner outcome datasets, and create community engagement around protocol participation.

**Moat boundary**: The challenge engine rule evaluation logic and behavioral sequencing heuristics are protected per M-003 in `docs/MOAT_MODEL.md`. The `type` and `prompt` fields on Challenge objects may be returned to users; the underlying rule system must not be exposed.

---

## Challenge Model (from Domain Model)

The `Challenge` entity is defined in `docs/DOMAIN_MODEL.md`. The engine operates on these fields:

| Field | Type | Description |
|-------|------|-------------|
| `challenge_id` | UUID | Unique identifier |
| `protocol_id` | UUID | Parent protocol reference |
| `type` | enum | `adherence \| educational \| experiential` |
| `prompt` | string | The challenge instruction or question shown to the user |
| `due_day` | integer | Day within the protocol timeline when challenge is presented |
| `completion_status` | enum | `pending \| completed \| skipped` |
| `response` | object | User's recorded response or completion data |

---

## Challenge Types

### Type: `adherence`

**Purpose**: Reinforce protocol step completion. Measures whether the user applied the protocol as instructed.

**Trigger**: Presented on schedule according to `due_day`. May also be triggered by a missed daily signal.

**Expected Response**:
- Confirmation of completion (boolean)
- Optional: intensity, timing, or method variation notes

**Adherence Impact**: Counts directly toward `adherence_score` and `challenge_completion_rate` on the Contributor Record.

**Examples**:
- "Did you apply your Lavender Calm Blend topically this morning?"
- "Have you diffused your Focus Protocol blend for at least 20 minutes today?"

---

### Type: `educational`

**Purpose**: Build user knowledge and engagement with the protocol's therapeutic rationale. Increases confidence and long-term adherence.

**Trigger**: Presented at key protocol milestones (beginning, midpoint, and protocol completion).

**Expected Response**:
- Acknowledgment or a short comprehension response

**Adherence Impact**: Completion contributes to `challenge_completion_rate` but is lower-weighted than `adherence` type.

**Examples**:
- "Lavender contains linalool, which supports the nervous system. What calming effect have you noticed so far?"
- "Your protocol enters Phase 2 today. Phase 2 introduces Frankincense for deeper grounding. Read the phase guide to prepare."

---

### Type: `experiential`

**Purpose**: Capture qualitative outcome data and personal response patterns. Supports protocol evolution signal generation.

**Trigger**: Presented at outcome-relevant windows (e.g., Day 7, Day 14, Day 30 within a protocol).

**Expected Response**:
- Structured self-assessment (e.g., energy, mood, sleep quality rating 1–10)
- Optional: free-text outcome note

**Adherence Impact**: Completion contributes to `challenge_completion_rate`. Response data feeds the Contributor Analytics pipeline.

**Examples**:
- "Rate your sleep quality over the past 7 days (1–10). Any changes since starting your protocol?"
- "How would you describe your energy levels compared to before starting the Sleep Reset Protocol?"

---

## Challenge Sequencing Rules

### Rule 1: Minimum Spacing

No two challenges may be presented on the same `due_day` for the same protocol. Minimum spacing of 1 day between challenges.

### Rule 2: Phase Alignment

Challenges must be assigned to days that fall within their parent protocol phase. A challenge on Day 10 must belong to a phase whose day range includes Day 10.

### Rule 3: Type Distribution

A well-formed protocol challenge set should include:
- At least one `adherence` challenge per phase
- At least one `educational` challenge at the start of each phase
- At least one `experiential` challenge per protocol (minimum one per 14-day window)

### Rule 4: Skip Rate Monitoring

If a challenge's skip rate exceeds 40% across the contributor population (as tracked by the Contributor Analytics Agent), the challenge is flagged as a protocol evolution candidate. See `docs/autonomous_iteration_protocol.md` for the evolution workflow.

### Rule 5: Due Day Immutability

Once a challenge is assigned to a user's active protocol, its `due_day` is immutable. Rescheduling requires a new protocol version (MINOR bump per LOCK-005).

---

## Challenge Presentation Rules

The engine determines **when** and **how** to surface challenges to users.

### Presentation Timing

| Challenge Type | Default Presentation Window |
|---------------|----------------------------|
| `adherence` | Same day as `due_day` |
| `educational` | Day before `due_day` through `due_day + 1` |
| `experiential` | `due_day` through `due_day + 2` |

### Reminder Logic

- If no response is recorded within the presentation window, one reminder notification is sent.
- If no response after the reminder, `completion_status` transitions to `skipped` at window expiry.
- Skipped challenges are not re-presented in the same protocol run.

### Display Rules

- The `prompt` field is the only challenge content surfaced to the user.
- The challenge `type` may be surfaced as a category label (e.g., "Check-In", "Learn", "Reflect").
- The underlying rule evaluation logic, skip-rate thresholds, and sequencing heuristics must not appear in any user-facing or API response payload.

---

## Challenge Lifecycle State Machine

```
CREATED
   │
   ▼
PENDING  ──── (due day arrives) ──► PRESENTED
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              COMPLETED            SKIPPED           (window expires)
                                                           │
                                                           ▼
                                                       SKIPPED
```

---

## Challenge Data Object

A complete challenge record:

```json
{
  "challenge_id": "chal-<uuid>",
  "protocol_id": "<protocol_id>",
  "type": "adherence",
  "prompt": "Did you apply your Grounding Blend to your wrists and neck this evening?",
  "due_day": 3,
  "completion_status": "completed",
  "response": {
    "completed": true,
    "notes": "Applied before bed, slept much better.",
    "recorded_at": "2026-04-13T22:04:00Z"
  }
}
```

---

## Analytics Integration

Challenge completion data feeds the Contributor Analytics Agent via the Contributor Record:

- `adherence_score`: Ratio of completed adherence challenges to total adherence challenges.
- `challenge_completion_rate`: Ratio of all completed challenges (all types) to total challenges.
- Skip patterns by challenge ID feed into the evolution signal model.

See `docs/autonomous_iteration_protocol.md` for how skip rate signals trigger evolution candidates.

---

## V1 Challenge Set Guidelines

For V1 protocol launch, each protocol must include:

| Protocol Length | Minimum Challenges | Suggested Distribution |
|----------------|-------------------|----------------------|
| 7 days | 3 | 2 adherence, 1 experiential |
| 14 days | 6 | 4 adherence, 1 educational, 1 experiential |
| 30 days | 12 | 7 adherence, 3 educational, 2 experiential |

All V1 challenges must be reviewed against the moat boundary before deployment to ensure rule logic is not exposed.
