export interface WPIFilters {
  year?: string;
  month?: string;
  majorGroup?: string;
  group?: string;
  subgroup?: string;
  item?: string;
  format?: string;
}

export interface MOSPIResult<T> {
  live: boolean;
  records: T[];
  source: string;
  retrievedAt: string;
  warning?: string;
  officialUrl: string;
}

export interface MOSPIProvider {
  getWPIRecords(filters: WPIFilters): Promise<MOSPIResult<Record<string, unknown>>>;
  getCPIData(): Promise<MOSPIResult<never>>;
  getAvailableIndicators(): Promise<MOSPIResult<never>>;
  getDatasetMetadata(): Promise<MOSPIResult<never>>;
}
