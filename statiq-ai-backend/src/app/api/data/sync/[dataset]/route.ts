import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { fetchWpiRecords } from "@/lib/integrations/mospi/mospiService";
import { db } from "@/db";
import { integrationSyncLogs, mospiWpiRecords } from "@/db/schema/integrations";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest, context: { params: Promise<{ dataset: string }> }) {
  const user = await getSession(req);
  // Ensure user is an admin
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ORG_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dataset } = await context.params;
  const normalizedDataset = dataset.toUpperCase();

  if (normalizedDataset !== "WPI") {
    return NextResponse.json({ error: "Only WPI dataset is currently supported for sync." }, { status: 400 });
  }

  const startTime = Date.now();
  
  // 1. Log the sync attempt
  const [syncRun] = await db.insert(integrationSyncLogs).values({
    source: "MoSPI API Platform",
    resource: "WPI",
    status: "RUNNING",
    startedAt: new Date(),
  }).returning();

  try {
    // 2. Fetch records directly from MoSPI API using our service
    const res = await fetchWpiRecords({ year: 2024 });

    if (res.statusCode !== 200 || !res.data) {
      // API error
      await db.update(integrationSyncLogs).set({
        status: "FAILED",
        errorMessage: res.error || `HTTP ${res.statusCode}`,
        finishedAt: new Date(),
      }).where(sql`${integrationSyncLogs.id} = ${syncRun.id}`);

      return NextResponse.json({
        success: false,
        dataset: normalizedDataset,
        status: "error",
        error: res.error || `MoSPI API returned ${res.statusCode}`
      }, { status: 502 });
    }

    // 3. Process and normalize records
    const rawRecords = Array.isArray(res.data) ? res.data : (res.data.data || res.data.records || []);
    let insertedCount = 0;

    if (rawRecords.length > 0) {
      const recordsToInsert = rawRecords.map((r: any) => {
        const monthNum = typeof r.month === "string" ? 
          (["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].indexOf(r.month.toLowerCase()) + 1) || 1 :
          (parseInt(r.month, 10) || 1);
        return {
          year: parseInt(r.year, 10) || 2024,
          month: monthNum,
          majorGroup: r.majorgroup || r.major_group || null,
          groupName: r.group || null,
          subgroup: r.subgroup || r.sub_group || null,
          item: r.item || null,
          value: r.index_value != null ? String(r.index_value) : null,
          unit: "Index",
          source: "MoSPI WPI API",
          fetchedAt: new Date(),
        };
      });

      // Insert in chunks
      const CHUNK_SIZE = 100;
      for (let i = 0; i < recordsToInsert.length; i += CHUNK_SIZE) {
        const chunk = recordsToInsert.slice(i, i + CHUNK_SIZE);
        await db.insert(mospiWpiRecords)
          .values(chunk)
          .onConflictDoNothing();
        insertedCount += chunk.length;
      }
    }

    // 4. Record success
    const duration = Date.now() - startTime;
    await db.update(integrationSyncLogs).set({
      status: "SUCCESS",
      recordsFetched: rawRecords.length,
      recordsUpserted: insertedCount,
      finishedAt: new Date(),
    }).where(sql`${integrationSyncLogs.id} = ${syncRun.id}`);

    return NextResponse.json({
      success: true,
      dataset: normalizedDataset,
      status: "SUCCESS",
      recordsFetched: rawRecords.length,
      recordsInserted: insertedCount,
      durationMs: duration
    });

  } catch (error: any) {
    await db.update(integrationSyncLogs).set({
      status: "FAILED",
      errorMessage: error.message,
      finishedAt: new Date(),
    }).where(sql`${integrationSyncLogs.id} = ${syncRun.id}`);

    return NextResponse.json({
      success: false,
      dataset: normalizedDataset,
      status: "FAILED",
      error: error.message
    }, { status: 500 });
  }
}
