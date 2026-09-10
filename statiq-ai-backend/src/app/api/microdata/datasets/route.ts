import { NextRequest } from "next/server";
import { unitDataClient } from "@/lib/integrations/mospi/unitdataClient";
import { unitDataHttp, logUnitData } from "@/lib/integrations/mospi/unitdataHttp";
import { cacheDatasets, logSearch } from "@/lib/integrations/mospi/unitdataCache";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// ── In-process response cache ─────────────────────────────────────────────────
// The Python subprocess that fetches NADA's full 13-page catalogue takes ~40 s
// on first call (no-query) or when searching (must fetch all pages client-side).
// Without a cache every page hit fires a new subprocess, causing ECONNRESET when
// concurrent subprocesses saturate the process's memory.
//
// TTL strategy:
//   • No-query browse (stable catalogue):  60 min
//   • Search query   (user-triggered):     5 min
//   • Error results:                       not cached — always retry

const BROWSE_TTL_MS = 60 * 60 * 1000;   // 60 min
const SEARCH_TTL_MS = 5  * 60 * 1000;   //  5 min

interface CacheEntry {
  result: Awaited<ReturnType<typeof unitDataClient.listDatasets>>;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<Awaited<ReturnType<typeof unitDataClient.listDatasets>>>>();

function cacheKey(q: string | null, page: number): string {
  return `${q ?? ""}::${page}`;
}

async function getDatasets(
  q: string | null,
  page: number,
): Promise<Awaited<ReturnType<typeof unitDataClient.listDatasets>>> {
  const key = cacheKey(q, page);

  // 1. Fresh cache hit
  const hit = responseCache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.result;

  // 2. Already fetching — join the inflight promise instead of spawning a second subprocess
  const existing = inflight.get(key);
  if (existing) return existing;

  // 3. Cold — spawn subprocess, guard with inflight
  const promise = unitDataClient.listDatasets(q, page).then((result) => {
    // Only cache successful results; errors should be retried immediately
    if (result.ok) {
      const ttl = q ? SEARCH_TTL_MS : BROWSE_TTL_MS;
      responseCache.set(key, { result, expiresAt: Date.now() + ttl });
    }
    return result;
  }).finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

export async function GET(req: NextRequest) {
  const started = Date.now();
  const q = req.nextUrl.searchParams.get("q") ?? req.nextUrl.searchParams.get("query");
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1") || 1;

  const result = await getDatasets(q || null, page);
  const session = await getSession(req);

  if (result.ok) {
    // Fire-and-forget DB cache write — must not block the response
    cacheDatasets(result.datasets).catch(() => undefined);
    logSearch({
      userId: session?.userId,
      query: q,
      page,
      resultCount: result.datasets.length,
      mode: result.mode,
    }).catch(() => undefined);
  } else {
    logSearch({
      userId: session?.userId,
      query: q,
      page,
      resultCount: 0,
      mode: result.mode,
    }).catch(() => undefined);
  }

  const response = unitDataHttp(result);
  logUnitData({
    endpoint: "GET /api/microdata/datasets",
    durationMs: Date.now() - started,
    status: response.status,
    category: result.ok ? "LIVE" : (result as any).category,
  });
  return response;
}
