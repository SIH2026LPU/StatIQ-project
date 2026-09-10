import { getDb } from "@/db";
import {
  unitdataAccessLogs,
  unitdataActivityLogs,
  unitdataAssignments,
  unitdataDatasets,
  unitdataDownloadLogs,
  unitdataFiles,
  unitdataSearchLogs,
  integrationSyncLogs,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

function pick(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim()) return String(value);
  }
  return null;
}

export async function cacheDatasets(rows: Record<string, unknown>[]) {
  if (!rows.length) return 0;
  const db = getDb();
  let upserted = 0;
  for (const row of rows) {
    const externalId = pick(row, ["idno", "id", "code"]) ?? "";
    const title = pick(row, ["title", "name", "nation"]) ?? "";
    if (!externalId || !title) continue;
    await db
      .insert(unitdataDatasets)
      .values({
        externalId,
        name: title.slice(0, 500),
        title: title.slice(0, 500),
        referenceId: pick(row, ["idno", "id"]),
        collection: pick(row, ["nation", "repo_title", "collection", "survey"]),
        year: pick(row, ["year", "data_coll_start", "created"]),
        surveyRound: pick(row, ["survey", "idno"]),
        description: pick(row, ["authoring_entity", "abstract", "description"]),
        sourceUrl: `https://microdata.gov.in/nada43/index.php/catalog/${encodeURIComponent(externalId)}`,
        accessStatus: pick(row, ["access", "published"]) ?? "official",
        metadata: row,
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: unitdataDatasets.externalId,
        set: {
          name: title.slice(0, 500),
          title: title.slice(0, 500),
          referenceId: pick(row, ["idno", "id"]),
          collection: pick(row, ["nation", "repo_title", "collection", "survey"]),
          year: pick(row, ["year", "data_coll_start", "created"]),
          description: pick(row, ["authoring_entity", "abstract", "description"]),
          metadata: row,
          lastSyncedAt: new Date(),
        },
      });
    upserted += 1;
  }
  return upserted;
}

export async function cacheFiles(datasetExternalId: string, files: Record<string, unknown>[]) {
  const db = getDb();
  const [dataset] = await db
    .select()
    .from(unitdataDatasets)
    .where(eq(unitdataDatasets.externalId, datasetExternalId))
    .limit(1);
  if (!dataset) return 0;
  let count = 0;
  for (const file of files) {
    const fileName = String(file.name ?? file.filename ?? "").slice(0, 500);
    if (!fileName) continue;
    await db
      .insert(unitdataFiles)
      .values({
        datasetId: dataset.id,
        fileName,
        format: pick(file, ["dctype", "format", "type"]),
        sizeBytes: file.size != null ? Number(file.size) || null : null,
        sourceFileId: pick(file, ["base64", "id"]),
        accessStatus: pick(file, ["access"]) ?? "official",
        metadata: file,
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [unitdataFiles.datasetId, unitdataFiles.fileName],
        set: {
          format: pick(file, ["dctype", "format", "type"]),
          sizeBytes: file.size != null ? Number(file.size) || null : null,
          sourceFileId: pick(file, ["base64", "id"]),
          metadata: file,
          lastSyncedAt: new Date(),
        },
      });
    count += 1;
  }
  return count;
}

export async function logSearch(params: {
  userId?: string;
  query?: string | null;
  page: number;
  resultCount: number;
  mode: string;
}) {
  try {
    await getDb().insert(unitdataSearchLogs).values({
      userId: params.userId ?? null,
      query: params.query ?? null,
      page: params.page,
      resultCount: params.resultCount,
      mode: params.mode,
    });
  } catch {
    // cache/audit must not block live API
  }
}

export async function logAccess(params: {
  userId?: string;
  role?: string;
  action: string;
  datasetId?: string;
  fileId?: string;
  status: string;
  category?: string;
}) {
  try {
    await getDb().insert(unitdataAccessLogs).values({
      userId: params.userId ?? null,
      role: params.role ?? null,
      action: params.action,
      datasetId: params.datasetId ?? null,
      fileId: params.fileId ?? null,
      status: params.status,
      category: params.category ?? null,
    });
    await getDb().insert(unitdataActivityLogs).values({
      userId: params.userId ?? null,
      role: params.role ?? null,
      action: params.action,
      datasetId: params.datasetId ?? null,
      fileId: params.fileId ?? null,
      status: params.status,
    });
  } catch {
    // ignore
  }
}

export async function logDownload(params: {
  userId?: string;
  datasetId: string;
  fileId: string;
  fileName?: string;
  status: string;
  category?: string;
}) {
  try {
    await getDb().insert(unitdataDownloadLogs).values(params);
  } catch {
    // ignore
  }
}

export async function unitdataStats() {
  const db = getDb();
  const [{ datasets }] = await db
    .select({ datasets: sql<number>`count(*)::int` })
    .from(unitdataDatasets);
  const [{ files }] = await db
    .select({ files: sql<number>`count(*)::int` })
    .from(unitdataFiles);
  const [last] = await db
    .select({ lastSyncedAt: unitdataDatasets.lastSyncedAt })
    .from(unitdataDatasets)
    .orderBy(sql`${unitdataDatasets.lastSyncedAt} desc nulls last`)
    .limit(1);
  const [sync] = await db
    .select()
    .from(integrationSyncLogs)
    .where(eq(integrationSyncLogs.source, "MoSPI UnitData"))
    .orderBy(sql`${integrationSyncLogs.startedAt} desc`)
    .limit(1);
  return {
    cachedDatasets: datasets ?? 0,
    cachedFiles: files ?? 0,
    lastSyncedAt: last?.lastSyncedAt ?? null,
    lastSyncStatus: sync?.status ?? null,
    lastError: sync?.errorMessage ?? null,
  };
}

export { unitdataAssignments };
