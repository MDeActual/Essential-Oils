import { ProtocolStatus } from "../../protocol/types";
import { IProtocolRepository } from "../../db/repositories/protocolRepository";
import { ProtocolDetail, ProtocolPhaseDetail, ProtocolSummary } from "../types";

export class ProtocolService {
  constructor(private readonly protocolRepository: IProtocolRepository) {}

  async listProtocols(): Promise<ProtocolSummary[]> {
    const result = await this.protocolRepository.findByStatus(ProtocolStatus.Active);
    // API is read-only and currently exposes only seeded protocols; include all statuses by fetching DRAFT/ACTIVE/COMPLETED/DEPRECATED.
    // To preserve existing behavior (list includes protocol-002 draft), we union all statuses.
    const drafts = await this.protocolRepository.findByStatus(ProtocolStatus.Draft);
    const completed = await this.protocolRepository.findByStatus(ProtocolStatus.Completed);
    const deprecated = await this.protocolRepository.findByStatus(ProtocolStatus.Deprecated);

    const all = [...drafts.items, ...result.items, ...completed.items, ...deprecated.items];
    // de-dupe by protocolId in case repository behavior changes
    const byId = new Map(all.map((p) => [p.protocolId, p]));

    return [...byId.values()].map((p) => ({
      protocolId: p.protocolId,
      version: p.version,
      goal: p.goal,
      durationDays: p.durationDays,
      status: p.status,
      phaseCount: p.phases.length,
      createdAt: p.createdAt,
    }));
  }

  async getProtocol(protocolId: string): Promise<ProtocolDetail | null> {
    const protocol = await this.protocolRepository.findById(protocolId);
    if (!protocol) return null;

    const phases: ProtocolPhaseDetail[] = protocol.phases.map((ph) => ({
      phaseIndex: ph.phaseIndex,
      label: ph.label,
      durationDays: ph.durationDays,
      instructions: ph.instructions,
    }));

    return {
      protocolId: protocol.protocolId,
      version: protocol.version,
      goal: protocol.goal,
      durationDays: protocol.durationDays,
      status: protocol.status,
      phases,
      challengeCount: protocol.challengeIds.length,
      createdAt: protocol.createdAt,
    };
  }
}
