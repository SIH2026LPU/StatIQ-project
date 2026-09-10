import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/db";
import { dataGovInRecords, dataGovInResources } from "@/db/schema";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ records: [], warning: "DATABASE_URL not set" }, { status: 503 });
  }
  const { id } = await context.params;
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0);
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50), 200);
  const db = getDb();
  const [resource] = await db.select().from(dataGovInResources).where(eq(dataGovInResources.resourceId, id)).limit(1);
  const rows = await db
    .select()
    .from(dataGovInRecords)
    .where(eq(dataGovInRecords.resourceId, id))
    .limit(limit)
    .offset(offset);
  return NextResponse.json({ resource: resource ?? null, totalHint: resource?.recordCount ?? rows.length, records: rows });
}
