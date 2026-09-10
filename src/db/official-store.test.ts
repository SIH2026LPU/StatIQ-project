import { officialRepo } from "@/db/official-store";
import { describe, expect, it } from "vitest";

describe("official upsert", () => {
  it("deduplicates by source + external_id", () => {
    officialRepo.upsertDataset({
      id: "ds-test",
      name: "Test",
      source: "test",
      sourceUrl: "https://example.invalid",
      category: "x",
      description: "x",
      frequency: "Annual",
      referencePeriod: "2024",
      lastUpdated: new Date().toISOString(),
      recordCount: 0,
      accessType: "open",
      theme: "WPI",
      externalId: "ext-1",
    });
    const first = officialRepo.upsertRecords("ds-test", [
      {
        id: "r1",
        datasetId: "ds-test",
        source: "test",
        sourceUrl: "https://example.invalid",
        externalId: "row-1",
        retrievedAt: new Date().toISOString(),
        payload: { value: 1 },
      },
    ]);
    const second = officialRepo.upsertRecords("ds-test", [
      {
        id: "r1b",
        datasetId: "ds-test",
        source: "test",
        sourceUrl: "https://example.invalid",
        externalId: "row-1",
        retrievedAt: new Date().toISOString(),
        payload: { value: 2 },
      },
    ]);
    expect(first.inserted).toBe(1);
    expect(second.inserted).toBe(0);
    expect(second.updated).toBe(1);
    expect(officialRepo.allRecords("ds-test")).toHaveLength(1);
    expect(officialRepo.allRecords("ds-test")[0]?.payload.value).toBe(2);
  });
});
