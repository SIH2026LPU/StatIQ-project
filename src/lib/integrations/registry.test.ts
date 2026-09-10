import { describe, expect, it } from "vitest";
import { loadDataSourceRegistry } from "@/lib/integrations/registry";

describe("data source registry CSV", () => {
  it("loads all six official sources from Api/DATA_SOURCE_REGISTRY.csv", () => {
    const rows = loadDataSourceRegistry();
    expect(rows).toHaveLength(6);
    expect(rows.map((row) => row.source)).toEqual([
      "MoSPI API Platform",
      "eSankhyiki",
      "MoSPI UnitData",
      "NSSTA",
      "iGOT Karmayogi",
      "data.gov.in",
    ]);
    expect(rows.every((row) => row.officialUrl.startsWith("https://"))).toBe(true);
  });
});
