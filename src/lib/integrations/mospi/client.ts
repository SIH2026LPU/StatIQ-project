import { mospiBaseUrl } from "./auth";
import type { MOSPIProvider, MOSPIResult, WPIFilters } from "./types";
import { getWPIRecords } from "./wpi";
import { backendJson } from "@/lib/backend";

const undocumented = (
  indicator: string,
): MOSPIResult<never> => ({
  live: false,
  records: [],
  source: "MoSPI API Platform",
  retrievedAt: new Date().toISOString(),
  warning: `${indicator}: no officially documented public endpoint is wired. Awaiting authorized API credentials / documented path.`,
  officialUrl: mospiBaseUrl(),
});

export class MOSPIClient implements MOSPIProvider {
  async getWPIRecords(filters: WPIFilters) {
    // Legacy direct HTTP connection for WPI
    return getWPIRecords(filters);
  }

  async getCPIData() {
    return undocumented("CPI");
  }

  async getAvailableIndicators() {
    try {
      const res = await backendJson<any>("/api/mospi/datasets", { method: "GET" });
      if (!res?.datasets) throw new Error("No datasets");
      const records = Object.values(res.datasets).map((d: any) => ({ name: d.name, description: d.description }));
      return {
        live: true,
        records: records as never[],
        source: "MoSPI API Platform (MCP)",
        retrievedAt: new Date().toISOString(),
        officialUrl: mospiBaseUrl(),
      };
    } catch {
      return undocumented("Indicator catalogue");
    }
  }

  async getDatasetMetadata() {
    try {
      const res = await backendJson<any>("/api/mospi/indicators?dataset=CPI", { method: "GET" });
      if (!res) throw new Error("No indicators");
      return {
        live: true,
        records: res as never[],
        source: "MoSPI API Platform (MCP)",
        retrievedAt: new Date().toISOString(),
        officialUrl: mospiBaseUrl(),
      };
    } catch {
      return undocumented("Dataset metadata");
    }
  }
}

export function getMOSPIProvider(): MOSPIProvider {
  return new MOSPIClient();
}
