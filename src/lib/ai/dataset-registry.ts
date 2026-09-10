import { officialRepo, type OfficialDataset, type OfficialRecord } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export interface DatasetMetadata {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  category: string;
  description: string;
  frequency: string;
  referencePeriod: string;
  recordCount: number;
  availableDimensions: string[];
  availableMetrics: string[];
  availablePeriods: string[];
  sampleRecord?: Record<string, unknown>;
}

/**
 * Searches and resolves a registered official dataset from the repository
 */
export function resolveOfficialDataset(queryOrId: string): { dataset: OfficialDataset; records: OfficialRecord[] } | null {
  ensureOfficialData().catch(() => undefined);

  const q = queryOrId.toLowerCase().trim();
  const allDatasets = officialRepo.listDatasets();

  // 1. Direct ID match
  let hit = officialRepo.getDataset(q) ?? allDatasets.find((d) => d.id.toLowerCase() === q || d.externalId.toLowerCase() === q);

  // 2. Keyword heuristic search across registered datasets
  if (!hit) {
    hit = allDatasets.find((d) => {
      const name = d.name.toLowerCase();
      const theme = d.theme.toLowerCase();
      const cat = d.category.toLowerCase();
      const desc = d.description.toLowerCase();

      if (q.includes("consumer price") || q.includes("retail inflation") || q.includes("cpi") || (q.includes("rural") && q.includes("urban") && q.includes("inflation"))) {
        return d.id === "ds-cpi" || d.theme === "CPI";
      }
      if (q.includes("wholesale price") || q.includes("wpi") || q.includes("commodity")) {
        return d.id === "ds-wpi" || d.theme === "WPI";
      }
      if (q.includes("labour") || q.includes("unemployment") || q.includes("lfpr") || q.includes("wpr") || q.includes("plfs") || q.includes("employment")) {
        return d.id === "ds-plfs" || d.theme === "PLFS";
      }
      if (q.includes("industrial production") || q.includes("iip") || q.includes("manufacturing index") || q.includes("mining")) {
        return d.id === "ds-iip" || d.theme === "IIP";
      }
      if (q.includes("annual survey of industries") || q.includes("asi") || q.includes("factory output") || q.includes("net value added")) {
        return d.id === "ds-asi" || d.theme === "ASI";
      }
      if (q.includes("national accounts") || q.includes("gdp") || q.includes("gva") || q.includes("nas")) {
        return d.id === "ds-nas" || d.theme === "NAS";
      }
      if (q.includes("energy") || q.includes("power") || q.includes("solar") || q.includes("renewable")) {
        return d.id === "ds-energy" || d.theme === "ENERGY";
      }

      return name.includes(q) || theme.includes(q) || cat.includes(q) || desc.includes(q);
    });
  }

  // Fallback to WPI if not found
  if (!hit) {
    hit = officialRepo.getDataset("ds-wpi") ?? allDatasets[0];
  }

  if (!hit) return null;

  const records = officialRepo.allRecords(hit.id);
  return { dataset: hit, records };
}

/**
 * Extracts schema metadata, available categorical dimensions, numeric metrics, and periods
 */
export function extractDatasetMetadata(dataset: OfficialDataset, records: OfficialRecord[]): DatasetMetadata {
  const dimensions = new Set<string>();
  const metrics = new Set<string>();
  const periods = new Set<string>();

  for (const rec of records) {
    const payload = rec.payload;
    for (const [key, val] of Object.entries(payload)) {
      if (key === "year" || key === "month" || key === "quarter" || key === "period") {
        if (val != null) periods.add(String(val));
      } else if (typeof val === "number" && !isNaN(val)) {
        metrics.add(key);
      } else if (typeof val === "string" && isNaN(Number(val))) {
        dimensions.add(key);
      }
    }
  }

  return {
    id: dataset.id,
    name: dataset.name,
    source: dataset.source,
    sourceUrl: dataset.sourceUrl,
    category: dataset.category,
    description: dataset.description,
    frequency: dataset.frequency,
    referencePeriod: dataset.referencePeriod,
    recordCount: records.length,
    availableDimensions: Array.from(dimensions),
    availableMetrics: Array.from(metrics),
    availablePeriods: Array.from(periods),
    sampleRecord: records[0]?.payload,
  };
}
