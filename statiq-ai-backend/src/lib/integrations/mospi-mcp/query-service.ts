/**
 * MoSPI Query Service
 *
 * Interprets a natural-language user query, follows the mandatory 4-step MCP workflow:
 *   1. list_datasets  → determine dataset
 *   2. get_indicators → determine indicator
 *   3. get_metadata   → get valid filter codes
 *   4. get_data       → fetch real data
 *
 * NEVER guesses filter codes — all codes come from get_metadata().
 */

import {
  mcpListDatasets,
  mcpGetIndicators,
  mcpGetMetadata,
  mcpGetData,
  type ListDatasetsResult,
  type GetIndicatorsResult,
  type GetMetadataResult,
  type DataRecord,
} from "./client";
import { mcpCache, TTL } from "./cache";

// ─── Normalized response type ─────────────────────────────────────────────────

export interface MoSPIQueryResult {
  success: boolean;
  source: {
    provider: "Ministry of Statistics and Programme Implementation";
    dataset: string;
    datasetName: string;
    sourceType: "official-government-api";
    officialUrl: "https://api.mospi.gov.in";
  };
  query: {
    userQuery: string;
    dataset: string;
    indicatorCode: number;
    indicatorName: string;
    filters: Record<string, unknown>;
    resolvedFilters: Record<string, string>; // Human-readable: { state: "Punjab", gender: "person" }
  };
  data: DataRecord[];
  metadata: {
    unit?: string;
    frequency?: string;
    availableYears?: string[];
    vizTypes?: string[];
  };
  fetchedAt: string;
  error?: string;
}

// ─── Dataset routing — map query keywords to MoSPI dataset codes ─────────────

const DATASET_KEYWORDS: [string[], string][] = [
  [["unemployment", "labour", "labor", "workforce", "lfpr", "wpr", "plfs", "employment rate", "worker population", "labour force"], "PLFS"],
  [["cpi", "consumer price", "retail inflation", "consumer inflation", "cost of living"], "CPI"],
  [["wpi", "wholesale price", "wholesale inflation", "producer price"], "WPI"],
  [["iip", "industrial production", "manufacturing index", "industrial output"], "IIP"],
  [["gdp", "gnp", "gva", "national accounts", "national income", "nas", "economic growth", "gross domestic"], "NAS"],
  [["asi", "annual survey of industries", "factory", "factory sector"], "ASI"],
  [["energy", "electricity", "fuel", "energy statistics"], "ENERGY"],
  [["aishe", "higher education", "university", "college enrollment", "ger", "gross enrollment"], "AISHE"],
  [["nfhs", "health survey", "fertility", "child mortality", "maternal health"], "NFHS"],
  [["isp", "service production", "services sector", "services index"], "ISP"],
];

/** Select the most relevant dataset for a user query */
function selectDataset(query: string, availableDatasets: ListDatasetsResult): string {
  const q = query.toLowerCase();
  for (const [keywords, code] of DATASET_KEYWORDS) {
    if (keywords.some((kw) => q.includes(kw))) {
      if (availableDatasets.datasets[code]) return code;
    }
  }
  // Default to PLFS for vague queries about people/economy
  return "PLFS";
}

// ─── Indicator routing ─────────────────────────────────────────────────────────

/** Select indicator_code from the indicators response based on query keywords */
function selectIndicator(
  query: string,
  indicatorsResult: GetIndicatorsResult,
  preferredFrequencyKey = "frequency_code_1_Annual",
): { code: number; name: string; frequencyKey: string } {
  const q = query.toLowerCase();

  // Try preferred frequency first, then any frequency
  const keys = [
    preferredFrequencyKey,
    ...Object.keys(indicatorsResult.indicators_by_frequency).filter((k) => k !== preferredFrequencyKey),
  ];

  const INDICATOR_KEYWORDS: [string[], string[]][] = [
    [["unemployment", "ur ", "unemployment rate"], ["ur", "unemployment rate", "unemployed"]],
    [["lfpr", "labour force participation", "labor force participation"], ["lfpr", "labour force participation"]],
    [["wpr", "worker population", "employed persons"], ["wpr", "worker population"]],
    [["wage", "salary", "earnings", "regular wage"], ["wage", "salary", "earnings", "regular"]],
    [["casual labour", "daily wage", "casual worker"], ["casual", "casual labour"]],
    [["self.employment", "self-employed"], ["self-employment", "self-employed"]],
    [["gdp", "gross domestic product"], ["gdp", "gross domestic"]],
    [["gva", "gross value added"], ["gva", "gross value added"]],
    [["gsdp", "state gdp"], ["gsdp", "nsdp"]],
  ];

  for (const key of keys) {
    const indicators = indicatorsResult.indicators_by_frequency[key] ?? [];
    for (const [queryKws, indicatorKws] of INDICATOR_KEYWORDS) {
      if (queryKws.some((kw) => q.includes(kw))) {
        const match = indicators.find((ind) =>
          indicatorKws.some((kw) => ind.description.toLowerCase().includes(kw)),
        );
        if (match) {
          return { code: match.indicator_code, name: match.description, frequencyKey: key };
        }
      }
    }
  }

  // Default to first indicator in preferred frequency
  for (const key of keys) {
    const first = indicatorsResult.indicators_by_frequency[key]?.[0];
    if (first) return { code: first.indicator_code, name: first.description, frequencyKey: key };
  }

  return { code: 1, name: "Default indicator", frequencyKey: preferredFrequencyKey };
}

// ─── Filter resolution ─────────────────────────────────────────────────────────

/** Resolve state name from query using metadata (never hardcoded) */
function resolveState(
  query: string,
  states: { state_code: number; description: string }[],
): { state_code: number; description: string } | null {
  const q = query.toLowerCase();
  // Look for state mentions — sorted by description length desc to prefer longer/more specific matches
  const sorted = [...states].sort((a, b) => b.description.length - a.description.length);
  for (const state of sorted) {
    if (q.includes(state.description.toLowerCase())) {
      return state;
    }
  }
  // India / all india
  if (q.includes("india") || q.includes("national") || q.includes("all india")) {
    const allIndia = states.find((s) => s.description.toLowerCase().includes("all india"));
    if (allIndia) return allIndia;
  }
  return null; // No state filter — will get all-India by default from API
}

/** Resolve gender code from query using metadata */
function resolveGender(
  query: string,
  genders: { gender_code: number; description: string }[],
): { gender_code: number; description: string } | null {
  const q = query.toLowerCase();
  if (q.includes("male") && !q.includes("female")) {
    return genders.find((g) => g.description.toLowerCase() === "male") ?? null;
  }
  if (q.includes("female") || q.includes("women") || q.includes("woman")) {
    return genders.find((g) => g.description.toLowerCase() === "female") ?? null;
  }
  // Default: "person" (all combined)
  return genders.find((g) => g.description.toLowerCase() === "person") ?? genders[0] ?? null;
}

/** Resolve sector (rural/urban/combined) from query using metadata */
function resolveSector(
  query: string,
  sectors: { sector_code: number; description: string }[],
): { sector_code: number; description: string } | null {
  const q = query.toLowerCase();
  if (q.includes("rural") && !q.includes("urban")) {
    return sectors.find((s) => s.description.toLowerCase() === "rural") ?? null;
  }
  if (q.includes("urban") && !q.includes("rural")) {
    return sectors.find((s) => s.description.toLowerCase() === "urban") ?? null;
  }
  // Default: rural + urban combined
  return sectors.find((s) => s.description.toLowerCase().includes("rural + urban")) ?? sectors[0] ?? null;
}

// ─── Data normalization ────────────────────────────────────────────────────────

function normalizeDataRecords(raw: GetDataResult["data"]): DataRecord[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as DataRecord[];
  if (typeof raw === "object" && "data" in raw && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: DataRecord[] }).data;
  }
  return [];
}

type GetDataResult = Awaited<ReturnType<typeof mcpGetData>>;

// ─── Main query function ──────────────────────────────────────────────────────

export async function queryMoSPI(userQuery: string): Promise<MoSPIQueryResult> {
  const fetchedAt = new Date().toISOString();
  console.log(`[MoSPI] User query: "${userQuery}"`);

  try {
    // ── STEP 1: list_datasets ─────────────────────────────────────────────────
    let datasetList = mcpCache.get<ListDatasetsResult>("datasets");
    if (!datasetList) {
      console.log("[MoSPI] Calling list_datasets...");
      datasetList = await mcpListDatasets();
      mcpCache.set("datasets", datasetList, TTL.DATASETS);
    } else {
      console.log("[MoSPI] Using cached dataset list");
    }

    const datasetCode = selectDataset(userQuery, datasetList);
    const datasetName = datasetList.datasets[datasetCode]?.name ?? datasetCode;
    console.log(`[MoSPI] Dataset: ${datasetCode} (${datasetName})`);

    // ── STEP 2: get_indicators ────────────────────────────────────────────────
    const indicatorCacheKey = `indicators:${datasetCode}`;
    let indicatorsResult = mcpCache.get<GetIndicatorsResult>(indicatorCacheKey);
    if (!indicatorsResult) {
      console.log(`[MoSPI] Calling get_indicators(${datasetCode})...`);
      indicatorsResult = await mcpGetIndicators(datasetCode);
      mcpCache.set(indicatorCacheKey, indicatorsResult, TTL.INDICATORS);
    } else {
      console.log(`[MoSPI] Using cached indicators for ${datasetCode}`);
    }

    const { code: indicatorCode, name: indicatorName } = selectIndicator(userQuery, indicatorsResult);
    console.log(`[MoSPI] Indicator: ${indicatorCode} — ${indicatorName}`);

    // ── STEP 3: get_metadata ──────────────────────────────────────────────────
    const metaCacheKey = `metadata:${datasetCode}:${indicatorCode}`;
    let metadataResult = mcpCache.get<GetMetadataResult>(metaCacheKey);
    if (!metadataResult) {
      console.log(`[MoSPI] Calling get_metadata(${datasetCode}, ${indicatorCode})...`);
      metadataResult = await mcpGetMetadata(datasetCode, indicatorCode);
      mcpCache.set(metaCacheKey, metadataResult, TTL.METADATA);
    } else {
      console.log(`[MoSPI] Using cached metadata for ${datasetCode}/${indicatorCode}`);
    }

    const filterValues = metadataResult.filter_values?.data ?? {};
    const availableYears = (filterValues.year ?? []).map((y) => y.year);
    console.log(`[MoSPI] Available years: ${availableYears.slice(0, 5).join(", ")}...`);

    // ── Construct filters from metadata (NEVER hardcode) ─────────────────────
    const filters: Record<string, unknown> = {
      dataset: datasetCode,
      indicator_code: indicatorCode,
    };
    const resolvedFilters: Record<string, string> = {
      dataset: datasetCode,
      indicator: indicatorName,
    };

    // State
    if (filterValues.state) {
      const state = resolveState(userQuery, filterValues.state);
      if (state) {
        filters.state_code = state.state_code;
        resolvedFilters.state = state.description;
      }
    }

    // Gender
    if (filterValues.gender) {
      const gender = resolveGender(userQuery, filterValues.gender);
      if (gender) {
        filters.gender_code = gender.gender_code;
        resolvedFilters.gender = gender.description;
      }
    }

    // Sector
    if (filterValues.sector) {
      const sector = resolveSector(userQuery, filterValues.sector);
      if (sector) {
        filters.sector_code = sector.sector_code;
        resolvedFilters.sector = sector.description;
      }
    }

    // Age — default to first option (usually "15 years and above" = all working-age)
    if (filterValues.age) {
      const defaultAge = filterValues.age[0];
      if (defaultAge) {
        filters.age_code = defaultAge.age_code;
        resolvedFilters.age = defaultAge.description;
      }
    }

    // Year — if query mentions specific years, add year filter
    const yearMatch = userQuery.match(/\b(20\d{2}(?:-\d{2})?)\b/g);
    if (yearMatch && yearMatch.length === 1 && availableYears.includes(yearMatch[0])) {
      filters.year = yearMatch[0];
      resolvedFilters.year = yearMatch[0];
    }

    console.log(`[MoSPI] Filters: ${JSON.stringify(resolvedFilters)}`);

    // ── STEP 4: get_data ──────────────────────────────────────────────────────
    console.log(`[MoSPI] Calling get_data(${datasetCode}, filters)...`);
    const dataResult = await mcpGetData(datasetCode, filters);
    const records = normalizeDataRecords(dataResult.data ?? (dataResult as any));
    console.log(`[MoSPI] Records returned: ${records.length}`);

    if (records.length === 0) {
      return {
        success: false,
        source: {
          provider: "Ministry of Statistics and Programme Implementation",
          dataset: datasetCode,
          datasetName,
          sourceType: "official-government-api",
          officialUrl: "https://api.mospi.gov.in",
        },
        query: { userQuery, dataset: datasetCode, indicatorCode, indicatorName, filters, resolvedFilters },
        data: [],
        metadata: { availableYears },
        fetchedAt,
        error: `MoSPI did not return data for these filters. Available years: ${availableYears.slice(0, 5).join(", ")}`,
      };
    }

    console.log(`[MoSPI] Status: OK — ${records.length} records in ${datasetCode}`);

    return {
      success: true,
      source: {
        provider: "Ministry of Statistics and Programme Implementation",
        dataset: datasetCode,
        datasetName,
        sourceType: "official-government-api",
        officialUrl: "https://api.mospi.gov.in",
      },
      query: { userQuery, dataset: datasetCode, indicatorCode, indicatorName, filters, resolvedFilters },
      data: records,
      metadata: { availableYears },
      fetchedAt,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[MoSPI] Error:`, message);
    return {
      success: false,
      source: {
        provider: "Ministry of Statistics and Programme Implementation",
        dataset: "UNKNOWN",
        datasetName: "Unknown",
        sourceType: "official-government-api",
        officialUrl: "https://api.mospi.gov.in",
      },
      query: { userQuery, dataset: "UNKNOWN", indicatorCode: 0, indicatorName: "", filters: {}, resolvedFilters: {} },
      data: [],
      metadata: {},
      fetchedAt,
      error: message.includes("MCP") || message.includes("connection") || message.includes("timeout")
        ? "MoSPI data service is currently unavailable. Please ensure the MCP server is running (`fastmcp run mospi_server.py:mcp --transport http --port 8000`)."
        : `MoSPI query failed: ${message}`,
    };
  }
}
