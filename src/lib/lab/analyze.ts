import type { OfficialRecord } from "@/db/official-store";

export function filterRecords(
  rows: OfficialRecord[],
  filters: Record<string, string>,
) {
  return rows.filter((row) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const cell = row.payload[key];
      return String(cell ?? "").toLowerCase().includes(value.toLowerCase());
    }),
  );
}

function coerceNumber(v: string | number | null | undefined): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "") return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export function numericColumn(rows: OfficialRecord[], column: string) {
  const result: number[] = [];
  for (const row of rows) {
    const n = coerceNumber(row.payload[column]);
    if (n !== null) result.push(n);
  }
  return result;
}

function medianSorted(sorted: number[]): number | null {
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function standardDeviation(values: number[], mean: number): number | null {
  if (values.length < 2) return null;
  const sqDiffs = values.map((v) => (v - mean) ** 2);
  const variance = sqDiffs.reduce((s, n) => s + n, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function basicStats(values: number[]) {
  if (!values.length) {
    return {
      count: 0,
      min: null as number | null,
      max: null as number | null,
      mean: null as number | null,
      median: null as number | null,
      stdDev: null as number | null,
      sum: null as number | null,
    };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = values.reduce((s, n) => s + n, 0);
  const mean = sum / values.length;
  const median = medianSorted(sorted);
  const stdDev = standardDeviation(values, mean);
  return { count: values.length, min, max, mean, median, stdDev, sum };
}

export function groupCounts(rows: OfficialRecord[], column: string) {
  const tally = new Map<string, number>();
  for (const row of rows) {
    const key = String(row.payload[column] ?? "(blank)");
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  return [...tally.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function groupNumericStats(
  rows: OfficialRecord[],
  groupColumn: string,
  numericColumn_: string,
) {
  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const groupKey = String(row.payload[groupColumn] ?? "(blank)");
    const num = coerceNumber(row.payload[numericColumn_]);
    if (num === null) continue;
    if (!buckets.has(groupKey)) buckets.set(groupKey, []);
    buckets.get(groupKey)!.push(num);
  }
  return [...buckets.entries()]
    .map(([label, values]) => {
      const stats = basicStats(values);
      return { label, count: values.length, mean: stats.mean, median: stats.median, total: stats.sum };
    })
    .sort((a, b) => b.count - a.count);
}

export function availableColumns(rows: OfficialRecord[]) {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row.payload)) keys.add(key);
  }
  return [...keys];
}

export function detectNumericColumns(rows: OfficialRecord[]): string[] {
  const candidateCounts = new Map<string, { numeric: number; total: number }>();
  for (const row of rows) {
    for (const [k, v] of Object.entries(row.payload)) {
      if (!candidateCounts.has(k)) candidateCounts.set(k, { numeric: 0, total: 0 });
      const entry = candidateCounts.get(k)!;
      entry.total += 1;
      if (coerceNumber(v) !== null) entry.numeric += 1;
    }
  }
  const result: string[] = [];
  for (const [col, { numeric, total }] of candidateCounts.entries()) {
    if (total > 0 && numeric / total >= 0.5) result.push(col);
  }
  return result;
}

export function timeSeries(
  rows: OfficialRecord[],
  numericCol: string,
  yearCol = "year",
  monthCol = "month",
) {
  const monthOrder = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  type Point = { label: string; year: number; monthIdx: number; values: number[]; mean: number | null; count: number };
  const map = new Map<string, Point>();
  for (const row of rows) {
    const year = coerceNumber(row.payload[yearCol]);
    const monthRaw = String(row.payload[monthCol] ?? "");
    const monthIdx = monthOrder.findIndex((m) => m.toLowerCase() === monthRaw.toLowerCase());
    if (year === null) continue;
    const label = monthIdx >= 0 ? `${monthOrder[monthIdx]} ${year}` : `${monthRaw || "?"} ${year}`;
    const key = `${year}-${monthIdx}`;
    if (!map.has(key)) {
      map.set(key, { label, year, monthIdx, values: [], mean: null, count: 0 });
    }
    const pt = map.get(key)!;
    const n = coerceNumber(row.payload[numericCol]);
    if (n !== null) {
      pt.values.push(n);
      pt.count += 1;
    }
  }
  const series = [...map.values()].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.monthIdx - b.monthIdx,
  );
  for (const pt of series) {
    const s = basicStats(pt.values);
    pt.mean = s.mean;
    pt.count = s.count;
  }
  return series.filter((s) => s.count > 0);
}
