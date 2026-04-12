/**
 * protocolStore.ts — In-Memory Protocol Data Store
 *
 * Provides a simple in-memory registry of Protocol records for use by the
 * protocol controllers. This store is the sole data source for the API layer's
 * protocol endpoints — controllers must not embed data directly.
 *
 * In a production deployment this would be replaced by a database-backed
 * repository. The store interface is intentionally minimal and read-only to
 * match the API's read-only contract.
 *
 * MOAT NOTICE (M-002): Protocol records stored here are structural data only.
 * The protocol generation algorithm is moat-protected and must not appear here.
 */

import { Protocol, ProtocolStatus } from "../../protocol/types";

/** Seed protocols for demonstration and integration testing. */
const PROTOCOL_REGISTRY: Protocol[] = [
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
        instructions: "Use diffuser blend for 30 minutes each morning and apply pulse-point blend each evening.",
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

/**
 * Returns all Protocol records in the registry.
 * Callers must not mutate the returned array or its contents.
 */
export function getAllProtocols(): ReadonlyArray<Readonly<Protocol>> {
  return PROTOCOL_REGISTRY;
}

/**
 * Returns a single Protocol by its canonical protocolId, or undefined if not found.
 */
export function getProtocolById(
  protocolId: string
): Readonly<Protocol> | undefined {
  return PROTOCOL_REGISTRY.find((p) => p.protocolId === protocolId);
}
