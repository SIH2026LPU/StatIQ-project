import { NextRequest, NextResponse } from "next/server";
import { unitDataClient, unitdataApiKeyConfigured } from "@/lib/integrations/mospi/unitdataClient";
import { unitdataStats } from "@/lib/integrations/mospi/unitdataCache";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const configured = unitdataApiKeyConfigured();
  const health = await unitDataClient.health();
  const stats = await unitdataStats().catch(() => ({
    cachedDatasets: 0,
    cachedFiles: 0,
    lastSyncedAt: null,
    lastSyncStatus: null,
    lastError: null,
  }));

  const status = !configured
    ? "NOT_CONFIGURED"
    : health.ok && health.status === "healthy"
      ? "LIVE"
      : "ERROR";

  return NextResponse.json({
    source: "MoSPI Microdata / UnitData",
    officialUrl: "https://microdata.gov.in",
    configured,
    authenticated: Boolean(health.ok && "authenticated" in health && health.authenticated),
    status,
    health: health.ok
      ? { status: health.status, authenticated: health.authenticated, error: health.error }
      : { status: "error", authenticated: false, error: health.error },
    lastSuccessfulSynchronization: stats.lastSyncedAt,
    lastError: stats.lastError,
    cachedDatasets: stats.cachedDatasets,
    cachedFiles: stats.cachedFiles,
    lastSynchronizationTime: stats.lastSyncedAt,
  });
}
