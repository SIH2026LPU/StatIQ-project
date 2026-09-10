import { spawn } from "child_process";
import path from "path";

export const UNITDATA_SOURCE = "MoSPI Microdata Portal";

export type UnitDataMode =
  | "LIVE"
  | "NOT_CONFIGURED"
  | "AUTH_REQUIRED"
  | "ERROR";

export type UnitDataErrorCategory =
  | "CONFIGURATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "SOURCE_ERROR"
  | "INVALID_REQUEST"
  | "NOT_FOUND";

export type UnitDataResult<T extends Record<string, unknown> = Record<string, unknown>> =
  | ({ ok: true } & T)
  | {
      ok: false;
      source: string;
      mode: UnitDataMode;
      error: string;
      category: UnitDataErrorCategory;
      errorCategory: UnitDataErrorCategory;
    };

function pythonInvocation(): { command: string; args: string[] } {
  if (process.env.PYTHON_EXECUTABLE) {
    return { command: process.env.PYTHON_EXECUTABLE, args: [] };
  }
  if (process.platform === "win32") {
    return { command: "py", args: ["-3"] };
  }
  return { command: "python3", args: [] };
}

function scriptPath() {
  return path.join(process.cwd(), "mospi", "unitdata_client.py");
}

function scrub(value: string) {
  const key = (process.env.MOSPI_UNITDATA_API_KEY || process.env.UNITDATA_API_KEY || "").trim();
  let out = value;
  if (key) out = out.split(key).join("[redacted]");
  return out.replace(/(api[_-]?key|x-api-key)[=:\s]+[^\s&]+/gi, "$1=[redacted]").slice(0, 800);
}

export function unitdataApiKeyConfigured() {
  return Boolean((process.env.MOSPI_UNITDATA_API_KEY || process.env.UNITDATA_API_KEY || "").trim());
}

export async function runUnitData<T extends Record<string, unknown>>(
  command: Record<string, unknown>,
  timeoutMs = 90_000,
): Promise<UnitDataResult<T>> {
  if (!unitdataApiKeyConfigured() && command.op !== "health") {
    return {
      ok: false,
      source: UNITDATA_SOURCE,
      mode: "NOT_CONFIGURED",
      error: "MOSPI_UNITDATA_API_KEY is not configured",
      category: "CONFIGURATION_ERROR",
      errorCategory: "CONFIGURATION_ERROR",
    };
  }

  const { command: py, args } = pythonInvocation();
  const payload = JSON.stringify(command);

  return new Promise((resolve) => {
    const child = spawn(py, [...args, scriptPath()], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
        PYTHONIOENCODING: "utf-8",
      },
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve({
        ok: false,
        source: UNITDATA_SOURCE,
        mode: "ERROR",
        error: "MoSPI UnitData request timed out.",
        category: "TIMEOUT",
        errorCategory: "TIMEOUT",
      });
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        source: UNITDATA_SOURCE,
        mode: "ERROR",
        error: scrub(err.message || "Failed to start Python UnitData adapter"),
        category: "SOURCE_ERROR",
        errorCategory: "SOURCE_ERROR",
      });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const parsed = JSON.parse(stdout) as UnitDataResult<T>;
        if (parsed && typeof parsed === "object") {
          resolve(parsed);
          return;
        }
      } catch {
        // fall through
      }
      resolve({
        ok: false,
        source: UNITDATA_SOURCE,
        mode: "ERROR",
        error: scrub(
          stdout.trim() ||
            stderr.trim() ||
            `UnitData adapter exited with code ${code ?? "unknown"}`,
        ),
        category: "SOURCE_ERROR",
        errorCategory: "SOURCE_ERROR",
      });
    });

    child.stdin.write(payload);
    child.stdin.end();
  });
}

export class MoSPIUnitDataClient {
  listDatasets(query?: string | null, page = 1) {
    return runUnitData<{
      source: string;
      mode: "LIVE";
      query: string | null;
      page: number;
      pageSize: number;
      total: number;
      datasets: Record<string, unknown>[];
    }>(
      { op: "list_datasets", query: query || null, page },
      query ? 120_000 : 60_000,
    );
  }

  getDataset(datasetId: string) {
    return runUnitData<{ source: string; mode: "LIVE"; dataset: Record<string, unknown> }>(
      { op: "get_dataset", dataset_id: datasetId },
      120_000,
    );
  }

  listFiles(datasetId: string) {
    return runUnitData<{
      source: string;
      mode: "LIVE";
      datasetId: string;
      files: Record<string, unknown>[];
    }>({ op: "list_files", dataset_id: datasetId });
  }

  downloadFile(datasetId: string, fileId: string, destination?: string) {
    return runUnitData<{
      source: string;
      mode: "LIVE";
      datasetId: string;
      fileName: string;
      path: string;
    }>({ op: "download_file", dataset_id: datasetId, file_id: fileId, destination }, 180_000);
  }

  downloadDataset(datasetId: string, destination?: string) {
    return runUnitData<{ source: string; mode: "LIVE"; datasetId: string; paths: string[] }>(
      { op: "download_dataset", dataset_id: datasetId, destination },
      300_000,
    );
  }

  syncCatalog() {
    return runUnitData<{
      source: string;
      mode: "LIVE";
      query: string | null;
      page: number;
      pageSize: number;
      total: number;
      datasets: Record<string, unknown>[];
    }>({ op: "sync_catalog" }, 180_000);
  }

  health() {
    return runUnitData<{
      status: string;
      authenticated: boolean;
      error?: string;
      pageSize?: number;
      category?: string;
    }>({ op: "health" }, 45_000);
  }
}

export const unitDataClient = new MoSPIUnitDataClient();
