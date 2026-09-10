import { eq } from "drizzle-orm";
import { getDb, hasPostgres } from "@/db/client";
import { dataSyncLogs, datasetRecords, datasets } from "@/db/schema";
import type { OfficialDataset, OfficialRecord, SyncLog } from "@/db/official-store";

export async function persistDataset(row: OfficialDataset) {
  if (!hasPostgres()) return;
  const db = getDb();
  await db
    .insert(datasets)
    .values({
      id: row.id,
      name: row.name,
      source: row.source,
      sourceUrl: row.sourceUrl,
      category: row.category,
      description: row.description,
      frequency: row.frequency,
      referencePeriod: row.referencePeriod,
      lastUpdated: new Date(row.lastUpdated),
      recordCount: row.recordCount,
      accessType: row.accessType,
      theme: row.theme,
      year: row.year,
      externalId: row.externalId,
    })
    .onConflictDoUpdate({
      target: datasets.id,
      set: {
        name: row.name,
        recordCount: row.recordCount,
        lastUpdated: new Date(row.lastUpdated),
        description: row.description,
        sourceUrl: row.sourceUrl,
      },
    });
}

export async function persistRecords(rows: OfficialRecord[]) {
  if (!hasPostgres() || !rows.length) return;
  const db = getDb();
  for (const row of rows) {
    await db
      .insert(datasetRecords)
      .values({
        id: row.id,
        datasetId: row.datasetId,
        source: row.source,
        sourceUrl: row.sourceUrl,
        externalId: row.externalId,
        retrievedAt: new Date(row.retrievedAt),
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
        payload: row.payload,
      })
      .onConflictDoUpdate({
        target: datasetRecords.id,
        set: {
          payload: row.payload,
          retrievedAt: new Date(row.retrievedAt),
          sourceUrl: row.sourceUrl,
        },
      });
  }
}

export async function persistSyncLog(log: SyncLog) {
  if (!hasPostgres()) return;
  const db = getDb();
  await db.insert(dataSyncLogs).values({
    id: log.id,
    source: log.source,
    startedAt: new Date(log.startedAt),
    finishedAt: new Date(log.finishedAt),
    recordsFound: log.recordsFound,
    recordsInserted: log.recordsInserted,
    recordsUpdated: log.recordsUpdated,
    recordsFailed: log.recordsFailed,
    status: log.status,
    error: log.error,
  });
}

export async function loadDatasetsFromPostgres() {
  if (!hasPostgres()) return [];
  const db = getDb();
  return db.select().from(datasets);
}

export async function loadRecordsFromPostgres(datasetId: string) {
  if (!hasPostgres()) return [];
  const db = getDb();
  return db.select().from(datasetRecords).where(eq(datasetRecords.datasetId, datasetId));
}
