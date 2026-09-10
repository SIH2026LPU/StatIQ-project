import { db } from "@/db";
import { dataGovInResources, dataGovInRecords, integrationSyncLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchAllRecords, fetchResource } from "./client";

export interface SyncResult {
  resourceId: string;
  fetched: number;
  upserted: number;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  error?: string;
}

/**
 * Syncs one data.gov.in resource into Postgres:
 *  - upserts resource metadata into `datagovin_resources`
 *  - inserts raw rows into `datagovin_records` (schema-agnostic JSONB payload,
 *    since every OGD resource has different fields)
 *  - writes an audit row into `integration_sync_logs`
 *
 * Safe to call from a cron/queue trigger or an API route (see
 * src/app/api/integrations/datagovin/sync/route.ts).
 */
export async function syncDataGovInResource(
  resourceId: string,
  opts: { maxRecords?: number } = {}
): Promise<SyncResult> {
  const [log] = await db
    .insert(integrationSyncLogs)
    .values({ source: "data.gov.in", resource: resourceId, status: "RUNNING" })
    .returning();

  try {
    const meta = await fetchResource(resourceId, { limit: 1 });

    await db
      .insert(dataGovInResources)
      .values({
        resourceId,
        title: meta.title,
        sector: meta.sector?.[0] ?? null,
        orgName: meta.org?.[0] ?? null,
        recordCount: meta.total,
        fields: meta.field?.map((f) => f.name) ?? [],
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: dataGovInResources.resourceId,
        set: {
          title: meta.title,
          recordCount: meta.total,
          lastSyncedAt: new Date(),
        },
      });

    const records = await fetchAllRecords(resourceId, {
      maxRecords: opts.maxRecords ?? 500,
    });

    if (records.length > 0) {
      // Chunk inserts to stay well under typical statement/parameter limits.
      const CHUNK = 200;
      for (let i = 0; i < records.length; i += CHUNK) {
        const chunk = records.slice(i, i + CHUNK);
        await db.insert(dataGovInRecords).values(
          chunk.map((payload) => ({
            resourceId,
            payload,
          }))
        );
      }
    }

    await db
      .update(integrationSyncLogs)
      .set({
        status: "SUCCESS",
        recordsFetched: records.length,
        recordsUpserted: records.length,
        finishedAt: new Date(),
      })
      .where(eq(integrationSyncLogs.id, log.id));

    return { resourceId, fetched: records.length, upserted: records.length, status: "SUCCESS" };
  } catch (err) {
    const message = (err as Error).message;
    await db
      .update(integrationSyncLogs)
      .set({ status: "FAILED", errorMessage: message, finishedAt: new Date() })
      .where(eq(integrationSyncLogs.id, log.id));

    return { resourceId, fetched: 0, upserted: 0, status: "FAILED", error: message };
  }
}
