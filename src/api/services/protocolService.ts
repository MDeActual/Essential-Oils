import { Protocol, ProtocolStatus } from "../../protocol/types";
import type { IProtocolRepository, PaginationOptions } from "../../db";

export interface ProtocolService {
  listProtocols(): Promise<Protocol[]>;
  getProtocolById(protocolId: string): Promise<Protocol | null>;
}

async function collectAllPages<T>(
  fetchPage: (pagination: PaginationOptions) => Promise<{ items: T[]; total: number }>,
  pageSize = 100
): Promise<T[]> {
  const items: T[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchPage({ limit: pageSize, offset });
    items.push(...page.items);
    offset += page.items.length;
    if (offset >= page.total || page.items.length === 0) break;
  }

  return items;
}

export class RepositoryProtocolService implements ProtocolService {
  constructor(private readonly protocolRepository: IProtocolRepository) {}

  async listProtocols(): Promise<Protocol[]> {
    const statuses: ProtocolStatus[] = [
      ProtocolStatus.Draft,
      ProtocolStatus.Active,
      ProtocolStatus.Completed,
      ProtocolStatus.Deprecated,
    ];

    const pages = await Promise.all(
      statuses.map((status) =>
        collectAllPages((pagination) =>
          this.protocolRepository.findByStatus(status, pagination)
        )
      )
    );

    return pages.flat();
  }

  getProtocolById(protocolId: string): Promise<Protocol | null> {
    return this.protocolRepository.findById(protocolId);
  }
}
