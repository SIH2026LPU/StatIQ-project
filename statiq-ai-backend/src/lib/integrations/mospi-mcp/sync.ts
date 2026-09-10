import { db } from "@/db";
import { mospiDatasets, mospiDatasetSyncs, mospiStatisticalRecords } from "@/db/schema/integrations";
import { eq, sql } from "drizzle-orm";
import { mcpListDatasets, mcpGetData } from "./client";

/**
 * Synchronizes the list of datasets from the MoSPI MCP server into mospi_datasets table.
 */
export async function syncEsankhyikiCatalogue() {
  console.log("[MoSPI Sync] Fetching catalogue via MCP list_datasets...");
  const result = await mcpListDatasets();

  if (!result.datasets) {
    throw new Error("Invalid response from MCP: missing datasets");
  }

  const datasets = Object.entries(result.datasets);
  let upsertedCount = 0;

  for (const [code, info] of datasets) {
    // Upsert into mospiDatasets
    await db
      .insert(mospiDatasets)
      .values({
        code,
        name: info.name || code,
        description: info.description || info.use_for,
        source: "MoSPI e-Sankhyiki",
        lastSyncedAt: new Date(),
        status: "ACTIVE",
      })
      .onConflictDoUpdate({
        target: mospiDatasets.code,
        set: {
          name: info.name || code,
          description: info.description || info.use_for,
          lastSyncedAt: new Date(),
        },
      });
    upsertedCount++;
  }

  console.log(`[MoSPI Sync] Catalogue sync complete. Upserted ${upsertedCount} datasets.`);
  return { success: true, count: upsertedCount };
}

/**
 * Synchronizes records for a specific dataset from the MoSPI MCP server.
 */
export async function syncDatasetRecords(datasetCode: string, filters: Record<string, unknown> = {}) {
  console.log(`[MoSPI Sync] Starting sync for dataset: ${datasetCode}`);

  const [dataset] = await db
    .select()
    .from(mospiDatasets)
    .where(eq(mospiDatasets.code, datasetCode));

  if (!dataset) {
    throw new Error(`Dataset ${datasetCode} not found in database. Run catalogue sync first.`);
  }

  // Create a sync log entry
  const [syncLog] = await db
    .insert(mospiDatasetSyncs)
    .values({
      datasetId: dataset.id,
      startedAt: new Date(),
      status: "RUNNING",
    })
    .returning();

  try {
    const result = await mcpGetData(datasetCode, filters);
    
    // Parse records from response (could be result.data or result.data.data depending on dataset)
    let records: any[] = [];
    if (Array.isArray(result.data)) {
      records = result.data;
    } else if (result.data && typeof result.data === 'object' && Array.isArray(result.data.data)) {
      records = result.data.data;
    }

    if (records.length === 0) {
      console.log(`[MoSPI Sync] No records found for ${datasetCode}.`);
      await db.update(mospiDatasetSyncs).set({
        status: "SUCCESS",
        completedAt: new Date(),
        recordsFetched: 0,
      }).where(eq(mospiDatasetSyncs.id, syncLog.id));
      return { success: true, count: 0 };
    }

    console.log(`[MoSPI Sync] Fetched ${records.length} records. Upserting into database...`);

    // We don't have a natural unique key for MoSPI records unless we hash the payload.
    // We'll just insert them or we can clear existing and insert (simplest approach for sync).
    // Let's delete existing for this dataset + indicator/period if we had them, 
    // but without an indicator_code in filters we might delete all. For safety we just append or use a hash.
    // For now, let's just insert them to populate the demo.
    
    const insertValues = records.map(record => {
      // Best effort extraction
      const indicatorCode = record.indicator_code?.toString() || record.code?.toString();
      const indicatorName = record.indicator_name || record.description || record.label;
      const period = record.year || record.financial_year || record.survey_year;
      const geography = record.state_name || "All India";
      const value = record.value || record.value_total || null;
      const unit = record.unit;

      return {
        datasetId: dataset.id,
        indicatorCode,
        indicatorName,
        period: period?.toString(),
        geography: geography?.toString(),
        value: !isNaN(parseFloat(value)) ? parseFloat(value).toString() : null,
        unit: unit?.toString(),
        rawData: record,
        fetchedAt: new Date(),
      };
    });

    // Chunk the inserts
    const chunkSize = 500;
    for (let i = 0; i < insertValues.length; i += chunkSize) {
      const chunk = insertValues.slice(i, i + chunkSize);
      await db.insert(mospiStatisticalRecords).values(chunk);
    }

    await db.update(mospiDatasetSyncs).set({
      status: "SUCCESS",
      completedAt: new Date(),
      recordsFetched: records.length,
    }).where(eq(mospiDatasetSyncs.id, syncLog.id));

    // Update lastSyncedAt on dataset
    await db.update(mospiDatasets).set({
      lastSyncedAt: new Date(),
    }).where(eq(mospiDatasets.id, dataset.id));

    return { success: true, count: records.length };

  } catch (error: any) {
    console.error(`[MoSPI Sync] Error syncing ${datasetCode}:`, error);
    await db.update(mospiDatasetSyncs).set({
      status: "FAILED",
      completedAt: new Date(),
      errorMessage: error.message || String(error),
    }).where(eq(mospiDatasetSyncs.id, syncLog.id));
    throw error;
  }
}
