import { NextRequest, NextResponse } from "next/server";
import { getOfficialDataset, getBackendMospiHealth } from "@/lib/official-data-client";
import { officialRepo } from "@/db/official-store";
import { ensureOfficialData } from "@/lib/sync/ensure";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureOfficialData().catch(() => undefined);
  const { searchParams } = new URL(req.url);
  const datasetId = searchParams.get("datasetId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pagesRaw = searchParams.get("pages");
  const pages = pagesRaw ? Math.max(1, Math.min(5, parseInt(pagesRaw, 10) || 1)) : 1;

  if (!datasetId) {
    return NextResponse.json(
      { success: false, error: "datasetId is required" },
      { status: 400 },
    );
  }

  const dataset = officialRepo.getDataset(datasetId);
  const filters: Record<string, string | number | undefined> = { page };
  for (const [k, v] of searchParams.entries()) {
    if (k !== "datasetId" && k !== "pages" && k !== "page") {
      filters[k] = v;
    }
  }

  const live = await getOfficialDataset(datasetId, filters, { dataset, pages });
  const mospi = await getBackendMospiHealth().catch(() => ({
    authenticated: false,
    status: "unknown",
    latencyMs: 0,
  }));

  const payload = {
    ...live,
    success: live.mode !== "ERROR",
    // Required data contract fields
    count: live.records.length,
    pageSize: live.records.length,
    hasMore: live.totalRecordsAvailable > live.recordsFetched,
    fetchedAt: live.retrievedAt,
    // Diagnostic extras
    cachedRecordCount: dataset?.recordCount ?? 0,
    accessType: dataset?.accessType ?? "unknown",
    backendMospi: mospi,
    page,
  };

  if (live.mode === "ERROR") {
    const timeout = /timeout/i.test(live.error ?? "");
    return NextResponse.json(
      {
        ...payload,
        error: timeout ? "MOSPI_UPSTREAM_TIMEOUT" : live.error,
        dataset: datasetId === "ds-wpi" ? "WPI" : datasetId,
      },
      { status: timeout ? 504 : 502 },
    );
  }

  return NextResponse.json(payload);
}
