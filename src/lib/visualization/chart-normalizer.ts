/**
 * chart-normalizer.ts
 *
 * Responsibilities:
 * - normalize numbers
 * - normalize dates
 * - preserve missingness (null)
 * - preserve source fields
 */

export class ChartDataNormalizer {
  /**
   * Normalizes an array of records for chart consumption.
   * NEVER silently replace missing values with zero.
   * If missing, use null unless the dataset defines it as zero.
   */
  static normalizeRecords(data: any[]): any[] {
    if (!Array.isArray(data)) return [];

    return data.map((record) => {
      const normalizedRecord: any = { ...record };

      for (const key of Object.keys(normalizedRecord)) {
        const val = normalizedRecord[key];

        // Preserve nulls
        if (val === null || val === undefined || val === "") {
          normalizedRecord[key] = null;
          continue;
        }

        // Try parsing string numbers strictly
        if (typeof val === "string") {
          // Check if it's a valid date string (naive check for now, can be expanded based on exact dataset format)
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
            // It's an ISO Date
            normalizedRecord[key] = new Date(val).toISOString();
            continue;
          }

          // If it looks like a number, parse it.
          // But only if it's purely numeric (to avoid converting categorical strings like "10-20 Age Group")
          if (/^-?\d+(\.\d+)?$/.test(val.trim())) {
            normalizedRecord[key] = Number(val);
          }
        }
      }

      return normalizedRecord;
    });
  }

  /**
   * Normalizes a legacy or unvalidated chart specification into a canonical ChartSpec.
   * Handles cases where xAxis and yAxis were passed as simple strings by older AI schemas.
   */
  static normalizeChartSpec(rawSpec: any): any {
    if (!rawSpec || typeof rawSpec !== "object") return rawSpec;
    
    const normalized = { ...rawSpec };

    // Support legacy Cartesian charts where axes are strings
    if (["line", "bar", "grouped_bar", "stacked_bar", "area", "stacked_area", "scatter"].includes(normalized.type)) {
      if (typeof normalized.xAxis === "string") {
        normalized.xAxis = { field: normalized.xAxis, type: "category" };
      }
      if (typeof normalized.yAxis === "string") {
        normalized.yAxis = { field: normalized.yAxis, type: "value" };
      }
      
      // Also map string series arrays to ChartSeries objects
      if (Array.isArray(normalized.series)) {
        normalized.series = normalized.series.map((s: any) => {
          if (typeof s === "string") {
            return { field: s };
          }
          return s;
        });
      }
    }

    // Support migrating old Cartesian Pie/Donut definitions to Circular definitions
    if (["pie", "donut"].includes(normalized.type)) {
      if (!normalized.labelField && typeof normalized.xAxis === "string") {
        normalized.labelField = normalized.xAxis;
        delete normalized.xAxis;
      }
      if (!normalized.labelField && normalized.xAxis?.field) {
        normalized.labelField = normalized.xAxis.field;
        delete normalized.xAxis;
      }
      if (!normalized.valueField && typeof normalized.yAxis === "string") {
        normalized.valueField = normalized.yAxis;
        delete normalized.yAxis;
      }
      if (!normalized.valueField && normalized.yAxis?.field) {
        normalized.valueField = normalized.yAxis.field;
        delete normalized.yAxis;
      }
    }

    return normalized;
  }
}
