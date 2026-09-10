import { discoverDatasets, getDatasetMetadata } from "./catalogue";
import { getEconomicCensus } from "./economic-census";
import { getMacroIndicators } from "./macro-indicators";
import type { ESankhyikiProvider } from "./types";

export class PublicESankhyikiProvider implements ESankhyikiProvider {
  discoverDatasets = discoverDatasets;
  getDatasetMetadata = getDatasetMetadata;
  getMacroIndicators = getMacroIndicators;
  getEconomicCensus = getEconomicCensus;

  async listDatasets() {
    try {
      const rows = await discoverDatasets();
      return rows.map((row) => ({
        title: row.title,
        sourceUrl: row.href,
        apiAvailable: false,
      }));
    } catch {
      return [
        {
          title: "Official statistics catalogue (eSankhyiki)",
          sourceUrl: process.env.ESANKHYIKI_BASE_URL ?? "https://esankhyiki.mospi.gov.in/",
          apiAvailable: false,
        },
      ];
    }
  }
}

export function getESankhyikiProvider() {
  return new PublicESankhyikiProvider();
}

export { discoverDatasets, getDatasetMetadata } from "./catalogue";
export { getMacroIndicators } from "./macro-indicators";
export { getEconomicCensus } from "./economic-census";
export type { CatalogueEntry, ESankhyikiProvider } from "./types";
