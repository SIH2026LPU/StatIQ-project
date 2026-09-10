const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";

export type BackendHealth = {
  status: "healthy" | "ok" | "degraded" | "error" | (string & {});
  services?: {
    database: { status: string; latencyMs?: number; error?: string };
    mospi_api: {
      status: string;
      latencyMs?: number;
      error?: string;
      authenticated?: boolean;
      tokenExpiresInSeconds?: number;
    };
    mospi_mcp: {
      status: string;
      latencyMs?: number;
      error?: string;
      url?: string;
    };
    mospi_unitdata?: {
      status: string;
      authenticated?: boolean;
      latencyMs?: number;
      error?: string;
    };
  };
  timestamp?: string;
  error?: string;
};

export async function getBackendHealth(): Promise<BackendHealth> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return { status: "error", error: `HTTP ${response.status}` };
    return (await response.json()) as BackendHealth;
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "backend unreachable",
    };
  }
}

export async function backendJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export { BACKEND_URL };
