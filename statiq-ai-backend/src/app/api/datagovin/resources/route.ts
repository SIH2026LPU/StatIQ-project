import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/db";
import { dataGovInResources } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ resources: [], warning: "DATABASE_URL not set" }, { status: 503 });
  }
  const db = getDb();
  const resources = await db.select().from(dataGovInResources).orderBy(desc(dataGovInResources.lastSyncedAt));
  return NextResponse.json({
    count: resources.length,
    resources,
    note: "Records appear after POST /api/integrations/datagovin/sync with a real data.gov.in resource UUID.",
  });
}
