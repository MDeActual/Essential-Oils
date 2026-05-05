import { ContributorRecord, DataOrigin } from "../../analytics/types";
import type { IContributorRepository, PaginationOptions } from "../../db";

export interface AnalyticsService {
  getContributorRecordsForAnalytics(): Promise<ContributorRecord[]>;
}

async function collectAllPages<T>(
  fetchPage: (pagination: PaginationOptions) => Promise<{ items: T[]; total: number }>,
  pageSize = 250
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

export class RepositoryAnalyticsService implements AnalyticsService {
  constructor(private readonly contributorRepository: IContributorRepository) {}

  async getContributorRecordsForAnalytics(): Promise<ContributorRecord[]> {
    return collectAllPages((pagination) =>
      this.contributorRepository.findByDataOrigin(DataOrigin.RealContributor, pagination)
    );
  }
}
