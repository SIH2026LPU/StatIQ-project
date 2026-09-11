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

let cachedHealth: { data: BackendHealth; timestamp: number } | null = null;
const HEALTH_CACHE_TTL = 10_000; // 10 seconds

export async function getBackendHealth(): Promise<BackendHealth> {
  const now = Date.now();
  if (cachedHealth && now - cachedHealth.timestamp < HEALTH_CACHE_TTL) {
    return cachedHealth.data;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1000), // Fast 1s timeout
    });
    if (!response.ok) {
      const errRes: BackendHealth = { status: "error", error: `HTTP ${response.status}` };
      cachedHealth = { data: errRes, timestamp: now };
      return errRes;
    }
    const data = (await response.json()) as BackendHealth;
    cachedHealth = { data, timestamp: now };
    return data;
  } catch (error) {
    const fallbackRes: BackendHealth = {
      status: "error",
      error: error instanceof Error ? error.message : "backend unreachable",
    };
    cachedHealth = { data: fallbackRes, timestamp: now };
    return fallbackRes;
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
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export { BACKEND_URL };
