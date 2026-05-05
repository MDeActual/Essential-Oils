import { ContributorRecord, DataOrigin, ExclusionReason, ExclusionStatus } from "../../analytics/types";
import { Protocol, ProtocolStatus } from "../../protocol/types";

export const SEED_PROTOCOLS: Protocol[] = [
  {
    protocolId: "protocol-001",
    version: "1.0.0",
    userProfileId: "user-001",
    goal: "Stress relief and relaxation",
    phases: [
      {
        phaseIndex: 0,
        label: "Preparation",
        durationDays: 7,
        blendIds: ["blend-lavender-chamomile"],
        oilIds: ["lavandula_angustifolia"],
        instructions: "Apply diluted lavender blend to pulse points each evening.",
      },
      {
        phaseIndex: 1,
        label: "Core Treatment",
        durationDays: 21,
        blendIds: ["blend-lavender-chamomile", "blend-bergamot-ylang"],
        oilIds: ["lavandula_angustifolia", "citrus_bergamia"],
        instructions:
          "Use diffuser blend for 30 minutes each morning and apply pulse-point blend each evening.",
      },
    ],
    durationDays: 28,
    challengeIds: ["challenge-001", "challenge-002"],
    createdAt: "2026-04-10T08:00:00Z",
    status: ProtocolStatus.Active,
  },
  {
    protocolId: "protocol-002",
    version: "1.0.0",
    userProfileId: "user-002",
    goal: "Energy and mental clarity",
    phases: [
      {
        phaseIndex: 0,
        label: "Foundation",
        durationDays: 14,
        blendIds: ["blend-peppermint-rosemary"],
        oilIds: ["mentha_piperita"],
        instructions: "Inhale peppermint blend for 5 minutes each morning.",
      },
    ],
    durationDays: 14,
    challengeIds: ["challenge-003"],
    createdAt: "2026-04-11T09:00:00Z",
    status: ProtocolStatus.Draft,
  },
];

export const SEED_CONTRIBUTOR_RECORDS: ContributorRecord[] = [
  // Protocol 001 — two eligible records
  {
    recordId: "record-001",
    userId: "user-001",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 85,
    challengeCompletionRate: 90,
    recordedAt: "2026-04-10T10:00:00Z",
  },
  {
    recordId: "record-002",
    userId: "user-002",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 70,
    challengeCompletionRate: 75,
    recordedAt: "2026-04-11T10:00:00Z",
  },
  // Protocol 001 — one excluded record (low adherence)
  {
    recordId: "record-003",
    userId: "user-003",
    protocolId: "protocol-001",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Excluded,
    exclusionReason: ExclusionReason.AdherenceBelowThreshold,
    adherenceScore: 30,
    challengeCompletionRate: 40,
    recordedAt: "2026-04-11T11:00:00Z",
  },
  // Protocol 002 — one eligible record
  {
    recordId: "record-004",
    userId: "user-004",
    protocolId: "protocol-002",
    dataOrigin: DataOrigin.RealContributor,
    exclusionStatus: ExclusionStatus.Included,
    adherenceScore: 95,
    challengeCompletionRate: 100,
    recordedAt: "2026-04-12T09:00:00Z",
  },
];

