export interface CatalogueEntry {
  title: string;
  href: string;
}

export interface ESankhyikiProvider {
  discoverDatasets(): Promise<CatalogueEntry[]>;
  getDatasetMetadata(href: string): Promise<{ title: string; sourceUrl: string }>;
  getMacroIndicators(): Promise<{ available: boolean; warning: string }>;
  getEconomicCensus(): Promise<{ available: boolean; warning: string }>;
}
