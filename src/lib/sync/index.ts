import { DATA_SOURCES } from "@/config/data-sources";
import { persistDataset, persistRecords, persistSyncLog } from "@/db/queries/datasets";
import { officialRepo, type OfficialRecord, type SyncLog } from "@/db/official-store";
import { extractOfficialLinks } from "@/lib/integrations/html-ingest";
import { getIGOTProvider } from "@/lib/integrations/igot";
import { getMOSPIProvider } from "@/lib/integrations/mospi";

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "StatIQ-AI/0.1 (SIH 26101 official-statistics ingest)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function log(partial: Omit<SyncLog, "id">): Promise<SyncLog> {
  const row: SyncLog = { id: `sync-${Date.now()}-${partial.source}`, ...partial };
  officialRepo.logs.unshift(row);
  try {
    await persistSyncLog(row);
  } catch {
    /* schema may not be migrated yet */
  }
  return row;
}

async function rememberDataset(row: Parameters<typeof officialRepo.upsertDataset>[0]) {
  const isNew = officialRepo.upsertDataset(row);
  try {
    const stored = officialRepo.getDataset(row.id);
    if (stored) await persistDataset(stored);
  } catch {
    /* optional postgres */
  }
  return isNew;
}

export async function syncMospi() {
  const startedAt = new Date().toISOString();
  const source = "mospi-api";
  const meta = DATA_SOURCES.find((s) => s.id === source)!;
  try {
    const wpi = await getMOSPIProvider().getWPIRecords({});
    await rememberDataset({
      id: "ds-wpi",
      name: "Wholesale Price Index",
      source: "MoSPI API Platform",
      sourceUrl: meta.officialUrl,
      category: "Prices",
      description:
        "WPI records from the official MoSPI API platform. Catalogue metadata tag above is informational. Live rows flow through StatIQ backend proxy — browser never holds MOSPI_API_TOKEN.",
      frequency: "Monthly",
      referencePeriod: "As published by MoSPI",
      lastUpdated: wpi.retrievedAt,
      recordCount: Array.isArray(wpi.records) ? wpi.records.length : 0,
      accessType: wpi.live
        ? "authenticated API (live-proxied)"
        : "awaiting live fetch (catalogue meta only)",
      theme: "WPI",
      externalId: "wpi",
    });
    let inserted = 0;
    let updated = 0;
    if (wpi.live && Array.isArray(wpi.records)) {
      const rows: OfficialRecord[] = wpi.records.map((item, index) => {
        const rec = (item ?? {}) as Record<string, unknown>;
        const externalId = String(rec.id ?? rec.item ?? index);
        const payload: Record<string, string | number | null> = {};
        for (const [k, v] of Object.entries(rec)) {
          payload[k] =
            typeof v === "number" || typeof v === "string"
              ? v
              : v == null
                ? null
                : String(v);
        }
        return {
          id: `wpi-${externalId}`,
          datasetId: "ds-wpi",
          source: "MoSPI API Platform",
          sourceUrl: meta.officialUrl,
          externalId,
          retrievedAt: wpi.retrievedAt,
          payload,
        };
      });
      const result = officialRepo.upsertRecords("ds-wpi", rows);
      inserted = result.inserted;
      updated = result.updated;
      try {
        await persistRecords(rows);
      } catch {
        /* optional postgres cache — live mode works even if this fails */
      }
    }
    const status = wpi.live ? "live_authenticated" : "catalogue_meta_only";
    officialRepo.health.set(source, {
      source: meta.name,
      status: wpi.live ? "LIVE & AUTHENTICATED" : "AWAITING LIVE FETCH",
      lastSync: startedAt,
      lastSuccess: wpi.live ? startedAt : officialRepo.health.get(source)?.lastSuccess,
      recordCount: officialRepo.getDataset("ds-wpi")?.recordCount ?? 0,
      lastError: wpi.warning,
      officialUrl: meta.officialUrl,
    });
    return await log({
      source,
      startedAt,
      finishedAt: new Date().toISOString(),
      recordsFound: Array.isArray(wpi.records) ? wpi.records.length : 0,
      recordsInserted: inserted,
      recordsUpdated: updated,
      recordsFailed: 0,
      status,
      error: wpi.warning,
    });
  } catch (error) {
    officialRepo.health.set(source, {
      source: meta.name,
      status: "ERROR",
      lastSync: startedAt,
      recordCount: officialRepo.getDataset("ds-wpi")?.recordCount ?? 0,
      lastError: error instanceof Error ? error.message : "sync failed",
      officialUrl: meta.officialUrl,
    });
    return await log({
      source,
      startedAt,
      finishedAt: new Date().toISOString(),
      recordsFound: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsFailed: 1,
      status: "error",
      error: error instanceof Error ? error.message : "sync failed",
    });
  }
}

export async function syncHtmlCatalogue(
  sourceId: "esankhyiki" | "nssta",
  category: string,
  theme: string,
) {
  const startedAt = new Date().toISOString();
  const meta = DATA_SOURCES.find((s) => s.id === sourceId)!;
  try {
    const html = await fetchHtml(meta.officialUrl);
    const links = extractOfficialLinks(html, meta.officialUrl).slice(0, 80);
    let inserted = 0;
    for (const [index, link] of links.entries()) {
      const id = `${sourceId}-${index}-${link.href.slice(-24).replace(/[^a-z0-9]/gi, "")}`;
      const isNew = await rememberDataset({
        id,
        name: link.title,
        source: meta.name,
        sourceUrl: link.href,
        category,
        description: `Discovered from official ${meta.name} HTML (ingestion, not an invented JSON API). Metadata only — no fabricated statistics.`,
        frequency: "Unknown",
        referencePeriod: "See source page",
        lastUpdated: startedAt,
        recordCount: 0,
        accessType: "open",
        theme,
        externalId: link.href,
      });
      if (isNew) inserted += 1;
    }
    officialRepo.health.set(sourceId, {
      source: meta.name,
      status: links.length ? "CONNECTED" : "DEGRADED",
      lastSync: startedAt,
      lastSuccess: startedAt,
      recordCount: links.length,
      officialUrl: meta.officialUrl,
    });
    return await log({
      source: sourceId,
      startedAt,
      finishedAt: new Date().toISOString(),
      recordsFound: links.length,
      recordsInserted: inserted,
      recordsUpdated: Math.max(links.length - inserted, 0),
      recordsFailed: 0,
      status: links.length ? "ok" : "degraded",
    });
  } catch (error) {
    officialRepo.health.set(sourceId, {
      source: meta.name,
      status: "ERROR",
      lastSync: startedAt,
      recordCount: [...officialRepo.datasets.values()].filter((d) => d.source === meta.name).length,
      lastError: error instanceof Error ? error.message : "ingest failed",
      officialUrl: meta.officialUrl,
    });
    return await log({
      source: sourceId,
      startedAt,
      finishedAt: new Date().toISOString(),
      recordsFound: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsFailed: 1,
      status: "error",
      error: error instanceof Error ? error.message : "ingest failed",
    });
  }
}

export async function syncUnitdata() {
  const startedAt = new Date().toISOString();
  const meta = DATA_SOURCES.find((s) => s.id === "unitdata")!;
  const configured = Boolean(process.env.MOSPI_UNITDATA_API_KEY || process.env.UNITDATA_API_KEY);
  officialRepo.health.set("unitdata", {
    source: meta.name,
    status: configured ? "DELEGATED_TO_BACKEND" : "NOT CONFIGURED",
    lastSync: startedAt,
    recordCount: 0,
    lastError: configured
      ? undefined
      : "MOSPI_UNITDATA_API_KEY missing. Live UnitData is served only by the StatIQ backend.",
    officialUrl: meta.officialUrl,
  });
  return await log({
    source: "unitdata",
    startedAt,
    finishedAt: new Date().toISOString(),
    recordsFound: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsFailed: 0,
    status: configured ? "ok" : "not_configured",
    error: configured ? undefined : "Awaiting authorized API credentials on the backend",
  });
}

export async function syncIgot() {
  const startedAt = new Date().toISOString();
  const meta = DATA_SOURCES.find((s) => s.id === "igot")!;
  const provider = getIGOTProvider();
  const official =
    process.env.IGOT_PROVIDER === "official" &&
    Boolean(process.env.IGOT_API_BASE_URL) &&
    Boolean(process.env.IGOT_API_KEY);

  // Use listBatches — the Sunbird-shaped method.
  // Each batch references a courseId + batchId (required for real enrollment).
  const batches = await provider.listBatches({ limit: 200 });
  const uniqueCourses = new Set(batches.map((b) => b.courseId)).size;

  officialRepo.health.set("igot", {
    source: meta.name,
    status: official ? "CONNECTED" : "MOCK — shaped to Sunbird API contract",
    lastSync: startedAt,
    lastSuccess: startedAt,
    recordCount: batches.length,
    lastError: official
      ? undefined
      : "Mock provider in use — shaped to Sunbird API contract. Awaiting authorized credentials.",
    officialUrl: meta.officialUrl,
  });
  return await log({
    source: "igot",
    startedAt,
    finishedAt: new Date().toISOString(),
    recordsFound: batches.length,
    recordsInserted: 0,
    recordsUpdated: uniqueCourses,
    recordsFailed: 0,
    status: official ? "ok" : "mock",
    error: official
      ? undefined
      : `MOCK — shaped to Sunbird API contract (${batches.length} batches across ${uniqueCourses} courses)`,
  });
}

export async function syncAll() {
  const mospi = await syncMospi();
  const esankhyiki = await syncHtmlCatalogue("esankhyiki", "Official statistics catalogue", "Macro");
  const nssta = await syncHtmlCatalogue("nssta", "Training programmes", "Training");
  const unitdata = await syncUnitdata();
  const igot = await syncIgot();
  return { mospi, esankhyiki, nssta, unitdata, igot };
}

export function listSourceHealth() {
  return DATA_SOURCES.map((src) => {
    return (
      officialRepo.health.get(src.id) ?? {
        source: src.name,
        status: src.requiresCredentials ? "NOT CONFIGURED" : "DEGRADED",
        recordCount: 0,
        officialUrl: src.officialUrl,
        lastError: "Not synchronized yet",
        lastSync: undefined,
        lastSuccess: undefined,
      }
    );
  });
}
