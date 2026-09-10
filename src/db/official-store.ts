export type AccessTypeTag =
  | "open"
  | "token"
  | "mock"
  | "not_configured"
  | "authenticated API"
  | "authenticated API (live-proxied)"
  | "catalogue meta only"
  | "awaiting live fetch (catalogue meta only)"
  | (string & {});

export interface OfficialDataset {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  category: string;
  description: string;
  frequency: string;
  referencePeriod: string;
  lastUpdated: string;
  recordCount: number;
  accessType: AccessTypeTag;
  theme: string;
  year?: string;
  externalId: string;
}

export interface OfficialRecord {
  id: string;
  datasetId: string;
  source: string;
  sourceUrl: string;
  externalId: string;
  retrievedAt: string;
  publishedAt?: string;
  payload: Record<string, string | number | null>;
}

export interface SyncLog {
  id: string;
  source: string;
  startedAt: string;
  finishedAt: string;
  recordsFound: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsFailed: number;
  status:
    | "ok"
    | "degraded"
    | "error"
    | "mock"
    | "not_configured"
    | "catalogue_meta_only"
    | "live_authenticated"
    | (string & {});
  error?: string;
}

export interface SourceHealth {
  source: string;
  status:
    | "CONNECTED"
    | "DEGRADED"
    | "MOCK"
    | "NOT CONFIGURED"
    | "ERROR"
    | "LIVE & AUTHENTICATED"
    | "AWAITING LIVE FETCH"
    | (string & {});
  lastSync?: string;
  lastSuccess?: string;
  recordCount: number;
  lastError?: string;
  officialUrl: string;
}

import { OFFICIAL_THEMATIC_DATASETS } from "@/config/official-thematic-datasets";

class OfficialRepository {
  datasets = new Map<string, OfficialDataset>();
  records = new Map<string, OfficialRecord[]>();
  logs: SyncLog[] = [];
  health = new Map<string, SourceHealth>();

  constructor() {
    this.seedDefaultThematicDatasets();
  }

  seedDefaultThematicDatasets() {
    for (const item of OFFICIAL_THEMATIC_DATASETS) {
      if (!this.datasets.has(item.dataset.id)) {
        this.datasets.set(item.dataset.id, item.dataset);
        if (item.sampleRecords.length > 0 && !this.records.has(item.dataset.id)) {
          this.records.set(item.dataset.id, item.sampleRecords);
        }
      }
    }
  }

  upsertDataset(row: OfficialDataset) {
    const existing = this.datasets.get(row.id);
    this.datasets.set(row.id, { ...existing, ...row });
    return !existing;
  }

  upsertRecords(datasetId: string, incoming: OfficialRecord[]) {
    const current = this.records.get(datasetId) ?? [];
    const byExt = new Map(current.map((r) => [`${r.source}:${r.externalId}`, r]));
    let inserted = 0;
    let updated = 0;
    for (const row of incoming) {
      const key = `${row.source}:${row.externalId}`;
      if (byExt.has(key)) {
        byExt.set(key, row);
        updated += 1;
      } else {
        byExt.set(key, row);
        inserted += 1;
      }
    }
    this.records.set(datasetId, [...byExt.values()]);
    const dataset = this.datasets.get(datasetId);
    if (dataset) dataset.recordCount = byExt.size;
    return { inserted, updated };
  }

  listDatasets(filters?: { source?: string; q?: string; theme?: string }) {
    this.seedDefaultThematicDatasets();
    let rows = [...this.datasets.values()];
    if (filters?.source) rows = rows.filter((r) => r.source === filters.source);
    if (filters?.theme) rows = rows.filter((r) => r.theme.toLowerCase() === filters.theme?.toLowerCase());
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.theme.toLowerCase().includes(q),
      );
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }

  getDataset(id: string) {
    if (this.datasets.has(id)) return this.datasets.get(id)!;
    const match = OFFICIAL_THEMATIC_DATASETS.find(
      (d) =>
        d.dataset.id.toLowerCase() === id.toLowerCase() ||
        d.dataset.theme.toLowerCase() === id.toLowerCase() ||
        `ds-${d.dataset.theme.toLowerCase()}` === id.toLowerCase()
    );
    if (match) {
      this.datasets.set(match.dataset.id, match.dataset);
      if (match.sampleRecords.length > 0 && !this.records.has(match.dataset.id)) {
        this.records.set(match.dataset.id, match.sampleRecords);
      }
      return match.dataset;
    }
    return null;
  }

  listRecords(datasetId: string, offset = 0, limit = 50) {
    const all = this.allRecords(datasetId);
    return { total: all.length, rows: all.slice(offset, offset + limit) };
  }

  allRecords(datasetId: string) {
    if (this.records.has(datasetId)) return this.records.get(datasetId)!;
    const match = OFFICIAL_THEMATIC_DATASETS.find(
      (d) =>
        d.dataset.id.toLowerCase() === datasetId.toLowerCase() ||
        d.dataset.theme.toLowerCase() === datasetId.toLowerCase() ||
        `ds-${d.dataset.theme.toLowerCase()}` === datasetId.toLowerCase()
    );
    if (match && match.sampleRecords.length > 0) {
      this.records.set(match.dataset.id, match.sampleRecords);
      return match.sampleRecords;
    }
    return [];
  }
}

export const officialRepo = new OfficialRepository();
