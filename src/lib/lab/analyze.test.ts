import { basicStats, filterRecords, numericColumn } from "@/lib/lab/analyze";
import type { OfficialRecord } from "@/db/official-store";
import { describe, expect, it } from "vitest";

const rows: OfficialRecord[] = [
  {
    id: "1",
    datasetId: "d",
    source: "s",
    sourceUrl: "https://example.invalid",
    externalId: "a",
    retrievedAt: "t",
    payload: { state: "Bihar", value: 10 },
  },
  {
    id: "2",
    datasetId: "d",
    source: "s",
    sourceUrl: "https://example.invalid",
    externalId: "b",
    retrievedAt: "t",
    payload: { state: "Kerala", value: 20 },
  },
];

describe("lab analyze", () => {
  it("filters and computes stats from records", () => {
    const filtered = filterRecords(rows, { state: "bihar" });
    expect(filtered).toHaveLength(1);
    const stats = basicStats(numericColumn(rows, "value"));
    expect(stats.count).toBe(2);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(20);
    expect(stats.mean).toBe(15);
  });
});
