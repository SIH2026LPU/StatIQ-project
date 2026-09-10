import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { integrationSyncLogs } from "@/db/schema";
import { requireRole } from "@/lib/auth/session";
import { unitDataClient } from "@/lib/integrations/mospi/unitdataClient";
import { cacheDatasets, unitdataStats } from "@/lib/integrations/mospi/unitdataCache";
import { unitDataHttp } from "@/lib/integrations/mospi/unitdataHttp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["SUPER_ADMIN", "ORG_ADMIN"]);
  if (!auth.ok) return auth.response;

  const db = getDb();
  const [log] = await db
    .insert(integrationSyncLogs)
    .values({ source: "MoSPI UnitData", resource: "catalog", status: "RUNNING" })
    .returning();

  const result = await unitDataClient.syncCatalog();
  if (!result.ok) {
    await db
      .update(integrationSyncLogs)
      .set({
        status: "FAILED",
        errorMessage: result.error,
        finishedAt: new Date(),
      })
      .where(eq(integrationSyncLogs.id, log.id));
    return unitDataHttp(result);
  }

  const rows = result.datasets;
  const upserted = await cacheDatasets(rows);

  await db
    .update(integrationSyncLogs)
    .set({
      status: "SUCCESS",
      recordsFetched: rows.length,
      recordsUpserted: upserted,
      finishedAt: new Date(),
    })
    .where(eq(integrationSyncLogs.id, log.id));

  const stats = await unitdataStats();
  return NextResponse.json({
    source: "MoSPI Microdata Portal",
    mode: "LIVE",
    fetched: rows.length,
    upserted,
    stats,
  });
}
