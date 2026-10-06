import { Protocol, ProtocolStatus } from "../../protocol/types";
import type { IProtocolRepository } from "../../db/repositories/protocolRepository";
import type { PaginationOptions, PagedResult } from "../../db/types";
import { LOCAL_DEVELOPMENT_TENANT_ID, validateTenantId } from "../../db/tenant";

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

export function getAllProtocols(
  tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID
): ReadonlyArray<Readonly<Protocol>> {
  return validateTenantId(tenantId) === LOCAL_DEVELOPMENT_TENANT_ID
    ? PROTOCOL_REGISTRY
    : [];
}

export function getProtocolById(
  protocolId: string,
  tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID
): Readonly<Protocol> | undefined {
  if (validateTenantId(tenantId) !== LOCAL_DEVELOPMENT_TENANT_ID) return undefined;
  return PROTOCOL_REGISTRY.find((protocol) => protocol.protocolId === protocolId);
}

export class MemoryProtocolRepository
  implements Pick<IProtocolRepository, "findById" | "findByStatus">
{
  private readonly tenantId: string;

  constructor(tenantId: string = LOCAL_DEVELOPMENT_TENANT_ID) {
    this.tenantId = validateTenantId(tenantId);
  }

  async findById(protocolId: string): Promise<Protocol | null> {
    return getProtocolById(protocolId, this.tenantId) ?? null;
  }

  async findByStatus(
    status: ProtocolStatus,
    pagination?: PaginationOptions
  ): Promise<PagedResult<Protocol>> {
    const matches = getAllProtocols(this.tenantId).filter(
      (protocol) => protocol.status === status
    );
    const offset = pagination?.offset ?? 0;
    const end =
      pagination?.limit === undefined ? undefined : offset + pagination.limit;

    return {
      items: matches.slice(offset, end) as Protocol[],
      total: matches.length,
    };
  }
}
