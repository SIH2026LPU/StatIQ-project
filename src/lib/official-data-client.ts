import { officialRepo, type OfficialDataset, type OfficialRecord } from "@/db/official-store";
import { backendJson } from "@/lib/backend";

export type DataSourceMode = "LIVE" | "CACHED" | "METADATA_ONLY" | "ERROR" | "LOADING";

export interface LiveDatasetResponse {
  datasetId: string;
  datasetName: string;
  source: string;
  officialUrl: string;
  mode: DataSourceMode;
  retrievedAt: string;
  records: OfficialRecord[];
  totalRecordsAvailable: number;
  recordsFetched: number;
  error?: string;
  warning?: string;
  fields: string[];
  numericFields: string[];
}

export interface DatasetLiveStatus {
  datasetId: string;
  mode: DataSourceMode;
  liveRecordCount: number;
  cachedRecordCount: number;
  lastChecked: string;
  error?: string;
}

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";
const MOSPI_RECORDS_PER_PAGE = 20;
const DEFAULT_PAGES_TO_FETCH = 1;
// 60 s matches MOSPI_REQUEST_TIMEOUT_MS on the backend so the upstream timeout
// fires first and returns a clean 504 rather than the frontend AbortSignal firing
// first and producing a generic network error.
const PER_PAGE_TIMEOUT_MS = 65_000;

function unwrapWpiBody(body: unknown): {
  records: Record<string, unknown>[];
  meta: { totalRecords?: number; totalPages?: number } | null;
  upstreamError?: { status: number; error: string };
} {
  if (body == null) return { records: [], meta: null };
  if (Array.isArray(body)) return { records: body as Record<string, unknown>[], meta: null };
  if (typeof body !== "object") return { records: [], meta: null };
  const obj = body as Record<string, unknown>;
  const statusCode = typeof obj.statusCode === "number" ? obj.statusCode : 0;
  if (obj.success === false || statusCode >= 400) {
    return {
      records: [],
      meta: null,
      upstreamError: {
        status: statusCode || 502,
        error: String(obj.error || obj.message || "MoSPI WPI request failed"),
      },
    };
  }
  if (Array.isArray(obj.data)) {
    return {
      records: obj.data as Record<string, unknown>[],
      meta: (obj.meta_data as { totalRecords?: number; totalPages?: number }) ?? null,
    };
  }
  if (Array.isArray(obj.records)) {
    return {
      records: obj.records as Record<string, unknown>[],
      meta: (obj.meta_data as { totalRecords?: number; totalPages?: number }) ?? null,
    };
  }
  return { records: [], meta: (obj.meta_data as { totalRecords?: number; totalPages?: number }) ?? null };
}

function normalizeWPIRecords(
  rawRecords: Record<string, unknown>[],
  datasetId: string,
  source: string,
  sourceUrl: string,
  retrievedAt: string,
): OfficialRecord[] {
  return rawRecords.map((item, index) => {
    const rec = item ?? {};
    const year = rec.year != null ? String(rec.year) : "";
    const month = rec.month != null ? String(rec.month) : "";
    const itemName = rec.item != null ? String(rec.item) : "";
    const major = rec.majorgroup != null ? String(rec.majorgroup) : "";
    const externalId = `wpi-${year}-${month}-${major}-${itemName}-${index}`.replace(/[^a-z0-9-]/gi, "-");
    const payload: Record<string, string | number | null> = {};
    for (const [k, v] of Object.entries(rec)) {
      if (k === "index_value") {
        const num = Number(v);
        payload[k] = Number.isFinite(num) ? num : v == null ? null : String(v);
      } else if (typeof v === "number" || typeof v === "string") {
        payload[k] = v;
      } else if (v == null) {
        payload[k] = null;
      } else {
        payload[k] = String(v);
      }
    }
    return {
      id: `live-${datasetId}-${index}-${Date.now()}`,
      datasetId,
      source,
      sourceUrl,
      externalId,
      retrievedAt,
      payload,
    };
  });
}

function detectFields(records: OfficialRecord[]): { fields: string[]; numericFields: string[] } {
  const fieldSet = new Set<string>();
  const numericSet = new Set<string>();
  const nonNumericSet = new Set<string>();
  for (const row of records) {
    for (const [k, v] of Object.entries(row.payload)) {
      fieldSet.add(k);
      if (typeof v === "number" && Number.isFinite(v)) {
        if (!nonNumericSet.has(k)) numericSet.add(k);
      } else if (typeof v === "string" && v.length > 0) {
        const num = Number(v);
        if (Number.isFinite(num) && /^-?\d+(\.\d+)?$/.test(v.trim())) {
          if (!nonNumericSet.has(k)) numericSet.add(k);
        } else {
          numericSet.delete(k);
          nonNumericSet.add(k);
        }
      }
    }
  }
  return { fields: [...fieldSet], numericFields: [...numericSet] };
}

async function fetchWPILive(
  datasetId: string,
  dataset: OfficialDataset | null,
  filters: Record<string, string | number | undefined> = {},
  pages = DEFAULT_PAGES_TO_FETCH,
): Promise<LiveDatasetResponse> {
  const retrievedAt = new Date().toISOString();
  const source = "MoSPI API Platform (live via StatIQ Backend)";
  const officialUrl = dataset?.sourceUrl ?? "https://api.mospi.gov.in";
  const datasetName = dataset?.name ?? "Wholesale Price Index";
  const errorBase = {
    datasetId,
    datasetName,
    source,
    officialUrl,
    retrievedAt,
    records: [] as OfficialRecord[],
    totalRecordsAvailable: 0,
    recordsFetched: 0,
    fields: [] as string[],
    numericFields: [] as string[],
  };

  try {
    const url = new URL("/api/mospi/wpi", BACKEND_URL);
    url.searchParams.set("Format", "JSON");
    url.searchParams.set("limit", String(MOSPI_RECORDS_PER_PAGE));
    const startPage = Math.max(1, Number(filters.page ?? 1) || 1);
    const pageCount = Math.max(1, Math.min(5, pages));
    for (const [k, v] of Object.entries(filters)) {
      if (v != null && v !== "" && k !== "page" && k !== "pages") url.searchParams.set(k, String(v));
    }

    const allRaw: Record<string, unknown>[] = [];
    let totalRecords = 0;
    let firstMeta: { totalRecords?: number; totalPages?: number } | null = null;

    for (let i = 0; i < pageCount; i++) {
      const page = startPage + i;
      url.searchParams.set("page", String(page));
      const pageRes = await fetch(url.toString(), {
        cache: "no-store",
        signal: AbortSignal.timeout(PER_PAGE_TIMEOUT_MS),
      });
      const body = await pageRes.json().catch(() => null);
      const unwrapped = unwrapWpiBody(body);

      if (!pageRes.ok || unwrapped.upstreamError) {
        const status = unwrapped.upstreamError?.status || pageRes.status;
        const message =
          unwrapped.upstreamError?.error ||
          (status === 504
            ? "MOSPI_UPSTREAM_TIMEOUT"
            : `MoSPI WPI request failed (HTTP ${status})`);
        return {
          ...errorBase,
          mode: "ERROR",
          error: message,
        };
      }

      if (!firstMeta && unwrapped.meta) firstMeta = unwrapped.meta;
      if (unwrapped.meta?.totalRecords) totalRecords = unwrapped.meta.totalRecords;
      if (unwrapped.records.length === 0) break;
      allRaw.push(...unwrapped.records);
      if (unwrapped.meta?.totalPages && page >= unwrapped.meta.totalPages) break;
    }

    if (!totalRecords && firstMeta?.totalRecords) totalRecords = firstMeta.totalRecords;

    const records = normalizeWPIRecords(allRaw, datasetId, source, officialUrl, retrievedAt);
    const { fields, numericFields } = detectFields(records);

    return {
      datasetId,
      datasetName,
      source,
      officialUrl,
      mode: "LIVE",
      retrievedAt,
      records,
      totalRecordsAvailable: totalRecords || records.length,
      recordsFetched: records.length,
      fields,
      numericFields,
      warning:
        records.length === 0
          ? undefined
          : records.length < totalRecords
            ? `Showing ${records.length} live records of ${totalRecords} total official records.`
            : undefined,
    };
  } catch (e: any) {
    const aborted = e?.name === "TimeoutError" || /aborted|timeout/i.test(String(e?.message));
    return {
      ...errorBase,
      mode: "ERROR",
      error: aborted ? "MOSPI_UPSTREAM_TIMEOUT" : (e?.message ?? "Unknown error fetching live WPI data"),
    };
  }
}

export async function getOfficialDataset(
  datasetId: string,
  filters: Record<string, string | number | undefined> = {},
  options: { dataset?: OfficialDataset | null; pages?: number } = {},
): Promise<LiveDatasetResponse> {
  const normId = datasetId.toLowerCase();
  if (normId === "ds-wpi" || normId === "wpi") {
    return fetchWPILive("ds-wpi", options.dataset ?? null, filters, options.pages);
  }

  // Look up dataset in repository
  const ds = options.dataset ?? officialRepo.getDataset(datasetId);
  const storedRecords = officialRepo.allRecords(ds?.id ?? datasetId);

  if (storedRecords.length > 0) {
    const { fields, numericFields } = detectFields(storedRecords);
    return {
      datasetId: ds?.id ?? datasetId,
      datasetName: ds?.name ?? datasetId,
      source: ds?.source ?? "Official Statistical Series",
      officialUrl: ds?.sourceUrl ?? "https://mospi.gov.in",
      mode: "LIVE",
      retrievedAt: new Date().toISOString(),
      records: storedRecords,
      totalRecordsAvailable: ds?.recordCount || storedRecords.length,
      recordsFetched: storedRecords.length,
      fields,
      numericFields,
      warning: undefined,
    };
  }

  return {
    datasetId,
    datasetName: ds?.name ?? datasetId,
    source: ds?.source ?? "Official Statistical Series",
    officialUrl: ds?.sourceUrl ?? "",
    mode: "METADATA_ONLY",
    retrievedAt: new Date().toISOString(),
    records: [],
    totalRecordsAvailable: 0,
    recordsFetched: 0,
    warning: `Live data endpoint not yet wired for dataset ${datasetId}. Catalogue metadata only.`,
    fields: [],
    numericFields: [],
  };
}

export async function getDatasetLiveStatus(
  datasetId: string,
  cachedCount: number,
): Promise<DatasetLiveStatus> {
  const lastChecked = new Date().toISOString();
  try {
    const live = await getOfficialDataset(datasetId, {}, { pages: 1 });
    return {
      datasetId,
      mode: live.mode,
      liveRecordCount: live.totalRecordsAvailable,
      cachedRecordCount: cachedCount,
      lastChecked,
      error: live.error,
    };
  } catch (e: any) {
    return {
      datasetId,
      mode: "ERROR",
      liveRecordCount: 0,
      cachedRecordCount: cachedCount,
      lastChecked,
      error: e?.message ?? "Unknown",
    };
  }
}

export async function getBackendMospiHealth(): Promise<{
  authenticated: boolean;
  status: string;
  latencyMs: number;
  tokenExpiresInSeconds?: number;
  error?: string;
}> {
  try {
    const health = await backendJson<any>("/api/health");
    const mospi = health?.services?.mospi_api ?? {};
    return {
      authenticated: Boolean(mospi.authenticated),
      status: mospi.status ?? "unknown",
      latencyMs: mospi.latencyMs ?? 0,
      tokenExpiresInSeconds: mospi.tokenExpiresInSeconds,
      error: mospi.error,
    };
  } catch (e: any) {
    return {
      authenticated: false,
      status: "backend_unreachable",
      latencyMs: 0,
      error: e?.message ?? "Backend unavailable",
    };
  }
}
