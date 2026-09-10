import { db } from "@/db";
import { mospiWpiRecords, integrationSyncLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.MOSPI_API_BASE_URL ?? "https://api.mospi.gov.in";
const TOKEN = process.env.MOSPI_API_TOKEN;

export interface WPIFilters {
  year?: number;
  month?: number;
  majorGroup?: string;
}

interface RawWpiRecord {
  year: number | string;
  month: number | string;
  major_group?: string;
  group?: string;
  subgroup?: string;
  item?: string;
  value?: number | string;
  unit?: string;
}

/**
 * MoSPI API Platform requires an authorized account/token (design.md #5-6).
 * This client is written against the documented request shape so it is a
 * one-line swap once MOSPI_API_TOKEN is issued to the project — until then,
 * calling it will throw a clear, actionable error rather than fabricating data.
 */
export async function fetchWpiRecords(filters: WPIFilters): Promise<RawWpiRecord[]> {
  if (!TOKEN) {
    throw new Error(
      "MOSPI_API_TOKEN is not set. Register at https://api.mospi.gov.in and add the token " +
        "to .env.local before calling the live WPI endpoint. Until then, use the synthetic " +
        "seed data (src/db/seed) for demo purposes and do not fabricate WPI figures."
    );
  }

  const params = new URLSearchParams();
  if (filters.year) params.set("year", String(filters.year));
  if (filters.month) params.set("month", String(filters.month));
  if (filters.majorGroup) params.set("major_group", filters.majorGroup);
  params.set("format", "json");

  const res = await fetch(`${BASE_URL}/api/wpi/getWpiRecords?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`MoSPI WPI API returned HTTP ${res.status}`);
  }

  const json = await res.json();
  return (json.records ?? json.data ?? []) as RawWpiRecord[];
}

/** Syncs WPI records into the `mospi_wpi_records` cache table with provenance. */
export async function syncWpiRecords(filters: WPIFilters) {
  const [log] = await db
    .insert(integrationSyncLogs)
    .values({ source: "MoSPI WPI API", resource: "wpi", status: "RUNNING" })
    .returning();

  try {
    const records = await fetchWpiRecords(filters);

    for (const r of records) {
      await db
        .insert(mospiWpiRecords)
        .values({
          year: Number(r.year),
          month: Number(r.month),
          majorGroup: r.major_group ?? null,
          groupName: r.group ?? null,
          subgroup: r.subgroup ?? null,
          item: r.item ?? null,
          value: r.value != null ? String(r.value) : null,
          unit: r.unit ?? null,
        })
        .onConflictDoUpdate({
          target: [
            mospiWpiRecords.year,
            mospiWpiRecords.month,
            mospiWpiRecords.majorGroup,
            mospiWpiRecords.groupName,
            mospiWpiRecords.subgroup,
            mospiWpiRecords.item,
          ],
          set: { value: r.value != null ? String(r.value) : null, fetchedAt: new Date() },
        });
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

    return { fetched: records.length };
  } catch (err) {
    await db
      .update(integrationSyncLogs)
      .set({ status: "FAILED", errorMessage: (err as Error).message, finishedAt: new Date() })
      .where(eq(integrationSyncLogs.id, log.id));
    throw err;
  }
}
