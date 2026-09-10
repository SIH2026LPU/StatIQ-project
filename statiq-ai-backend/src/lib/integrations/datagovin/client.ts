/**
 * Real client for the data.gov.in Open Government Data (OGD) API.
 *
 * This is the one external data source in the project that is genuinely
 * publicly callable today with a free, self-service key — good for a live
 * SIH demo. Get a key at https://data.gov.in -> login -> "My Account" -> "API Key".
 * DEMO_KEY works against a handful of demo resources without registering.
 *
 * URL shape (confirmed against the official platform):
 *   https://api.data.gov.in/resource/{resource_id}
 *     ?api-key=<key>&format=json&offset=0&limit=100&filters[field]=value
 */

const BASE_URL = process.env.DATAGOVIN_BASE_URL ?? "https://api.data.gov.in";
const API_KEY = process.env.DATAGOVIN_API_KEY ?? "DEMO_KEY";

export interface DataGovInResponse<T = Record<string, unknown>> {
  index_name: string;
  title: string;
  desc: string;
  org: string[];
  sector: string[];
  source: string;
  field: { id: string; name: string; type: string }[];
  total: number;
  count: number;
  limit: string;
  offset: string;
  records: T[];
}

export interface FetchResourceOptions {
  offset?: number;
  limit?: number;
  filters?: Record<string, string>;
  fields?: string[];
}

export class DataGovInError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly resourceId?: string
  ) {
    super(message);
    this.name = "DataGovInError";
  }
}

/**
 * Fetch one page of records from a data.gov.in resource.
 * `resourceId` is the UUID shown on the resource's page on data.gov.in
 * (e.g. the CPI/WPI/MGNREGA/eSankhyiki-linked resources listed there).
 */
export async function fetchResource<T = Record<string, unknown>>(
  resourceId: string,
  options: FetchResourceOptions = {}
): Promise<DataGovInResponse<T>> {
  const { offset = 0, limit = 100, filters = {}, fields } = options;

  const params = new URLSearchParams({
    "api-key": API_KEY,
    format: "json",
    offset: String(offset),
    limit: String(limit),
  });

  for (const [key, value] of Object.entries(filters)) {
    params.set(`filters[${key}]`, value);
  }
  if (fields?.length) {
    params.set("fields", fields.join(","));
  }

  const url = `${BASE_URL}/resource/${resourceId}?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      // data.gov.in can be slow under load; fail fast so a sync job doesn't hang forever
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new DataGovInError(
      `Network error calling data.gov.in: ${(err as Error).message}`,
      undefined,
      resourceId
    );
  }

  if (!res.ok) {
    throw new DataGovInError(
      `data.gov.in returned HTTP ${res.status} for resource ${resourceId}`,
      res.status,
      resourceId
    );
  }

  const json = (await res.json()) as DataGovInResponse<T>;
  return json;
}

/**
 * Fetch every page of a resource, following offset/limit until exhausted.
 * Use with care on large resources — pass a `maxRecords` ceiling for demos.
 */
export async function fetchAllRecords<T = Record<string, unknown>>(
  resourceId: string,
  options: { pageSize?: number; maxRecords?: number; filters?: Record<string, string> } = {}
): Promise<T[]> {
  const { pageSize = 100, maxRecords = 1000, filters } = options;
  const all: T[] = [];
  let offset = 0;

  while (all.length < maxRecords) {
    const page = await fetchResource<T>(resourceId, { offset, limit: pageSize, filters });
    all.push(...page.records);
    if (page.records.length < pageSize || all.length >= page.total) break;
    offset += pageSize;
  }

  return all.slice(0, maxRecords);
}
