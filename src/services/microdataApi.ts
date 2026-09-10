const BASE = "/api";

export type MicrodataMode = "LIVE" | "NOT_CONFIGURED" | "AUTH_REQUIRED" | "ERROR" | "RATE_LIMITED";

export type MicrodataDataset = Record<string, unknown> & {
  id?: string | number;
  idno?: string;
  title?: string;
};

export type DatasetsResponse =
  | {
      source: string;
      mode: "LIVE";
      query: string | null;
      page: number;
      pageSize?: number;
      total?: number;
      datasets: MicrodataDataset[];
    }
  | {
      source: string;
      mode: Exclude<MicrodataMode, "LIVE">;
      error: string;
      category?: string;
      message?: string;
    };

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Official MoSPI data is currently unavailable.");
  }
}

export async function getMicrodataDatasets(query?: string, page = 1) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("page", String(page));
  const res = await fetch(`${BASE}/microdata/datasets?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });
  return readJson<DatasetsResponse>(res);
}

export async function getMicrodataDataset(datasetId: string) {
  const res = await fetch(`${BASE}/microdata/datasets/${encodeURIComponent(datasetId)}`, {
    cache: "no-store",
    credentials: "include",
  });
  return readJson<{
    source: string;
    mode: MicrodataMode;
    dataset?: Record<string, unknown>;
    error?: string;
    category?: string;
  }>(res);
}

export async function getMicrodataFiles(datasetId: string) {
  const res = await fetch(`${BASE}/microdata/datasets/${encodeURIComponent(datasetId)}/files`, {
    cache: "no-store",
    credentials: "include",
  });
  return readJson<{
    source: string;
    mode: MicrodataMode;
    datasetId?: string;
    files?: Record<string, unknown>[];
    error?: string;
    category?: string;
    message?: string;
  }>(res);
}

export async function downloadMicrodataFile(datasetId: string, fileId: string) {
  const res = await fetch(
    `${BASE}/microdata/datasets/${encodeURIComponent(datasetId)}/files/${encodeURIComponent(fileId)}/download`,
    { method: "POST", credentials: "include" },
  );
  if (!res.ok) {
    return readJson<{ mode?: string; error?: string; message?: string }>(res);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  return { blob, fileName: match?.[1] ?? fileId };
}

export async function createMicrodataAssignment(payload: {
  sourceDatasetId: string;
  learnerUserId?: string;
  title?: string;
  tasks?: string[];
}) {
  const res = await fetch(`${BASE}/microdata/assignments`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson(res);
}

export function datasetKey(row: MicrodataDataset) {
  return String(row.idno ?? row.id ?? "");
}

export function fieldOrMissing(value: unknown) {
  if (value == null || String(value).trim() === "") return "Not provided by the source.";
  return String(value);
}
