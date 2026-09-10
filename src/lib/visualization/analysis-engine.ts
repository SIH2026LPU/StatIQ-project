export type AggregationType = "avg" | "sum" | "max" | "min" | "count" | "latest";

export interface AggregationResult {
  /** The aggregated records preserving original field names */
  records: Array<Record<string, any>>;
  /** Statistical summary of the aggregation */
  summary: {
    avg: number;
    max: number;
    maxLabel: string;
    min: number;
    minLabel: string;
    spread: number;
    totalPoints: number;
    distinctCategories: number;
  };
}

/**
 * Deterministically aggregates raw dataset records based on a dimension and a metric.
 * Unlike previous naive implementations, this preserves the original dimension and metric field names
 * so that they can be correctly routed to strict ChartSpecs and Data Tables.
 */
export function aggregateRecords(
  records: Array<any>,
  dimensionField: string,
  metricField: string,
  aggregation: AggregationType = "avg",
  limit: number = 0,
  sortOrder: "desc" | "asc" | "natural" = "desc"
): AggregationResult {
  if (!dimensionField || records.length === 0) {
    return {
      records: [],
      summary: { avg: 0, max: 0, maxLabel: "", min: 0, minLabel: "", spread: 0, totalPoints: 0, distinctCategories: 0 }
    };
  }

  // 1. Group records by dimension
  const map = new Map<string, { values: number[]; count: number; rawRows: any[] }>();

  for (const r of records) {
    // Determine dimension value
    const payload = r.payload ?? r; // Handle both wrapper objects {payload: {...}} and direct raw objects
    const dimRaw = payload[dimensionField];
    const dimLabel = dimRaw != null && String(dimRaw).trim() !== "" ? String(dimRaw).trim() : "Unknown";

    // Determine metric value
    const valRaw = metricField ? payload[metricField] : null;
    let valNum = typeof valRaw === "number" ? valRaw : Number(valRaw);
    if (isNaN(valNum)) valNum = 1;

    if (!map.has(dimLabel)) {
      map.set(dimLabel, { values: [], count: 0, rawRows: [] });
    }
    const entry = map.get(dimLabel)!;
    entry.values.push(valNum);
    entry.count += 1;
    entry.rawRows.push(payload);
  }

  // 2. Perform aggregation
  const aggregated = [...map.entries()].map(([label, data]) => {
    let finalValue = 0;
    
    if (aggregation === "count") {
      finalValue = data.count;
    } else if (aggregation === "sum") {
      finalValue = data.values.reduce((a, b) => a + b, 0);
    } else if (aggregation === "max") {
      finalValue = Math.max(...data.values);
    } else if (aggregation === "min") {
      finalValue = Math.min(...data.values);
    } else if (aggregation === "latest") {
      // For "latest", just take the last value in the series
      finalValue = data.values[data.values.length - 1] ?? 0;
    } else {
      // Default to average
      finalValue = data.values.length > 0 ? data.values.reduce((a, b) => a + b, 0) / data.values.length : 0;
    }

    // Return an object that PRESREVES the actual requested field names
    // so that charts and tables can read [dimensionField] and [metricField]
    return {
      [dimensionField]: label,
      [metricField]: Number(finalValue.toFixed(2)),
      _aggregated_count: data.count, // Metadata for tooltip
    };
  });

  // 3. Sort
  if (sortOrder === "desc") {
    aggregated.sort((a, b) => (b[metricField] as number) - (a[metricField] as number));
  } else if (sortOrder === "asc") {
    aggregated.sort((a, b) => (a[metricField] as number) - (b[metricField] as number));
  }

  // 4. Limit
  const finalRecords = limit > 0 ? aggregated.slice(0, limit) : aggregated;

  // 5. Generate Summary Stats
  let summary = { avg: 0, max: 0, maxLabel: "", min: 0, minLabel: "", spread: 0, totalPoints: 0, distinctCategories: 0 };
  
  if (finalRecords.length > 0) {
    const values = finalRecords.map(d => d[metricField] as number);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    
    const maxItem = finalRecords.reduce((prev, curr) => (curr[metricField] > prev[metricField] ? curr : prev), finalRecords[0]);
    const minItem = finalRecords.reduce((prev, curr) => (curr[metricField] < prev[metricField] ? curr : prev), finalRecords[0]);
    const spread = (maxItem[metricField] as number) - (minItem[metricField] as number);

    summary = {
      avg: Number(avg.toFixed(2)),
      max: maxItem[metricField] as number,
      maxLabel: String(maxItem[dimensionField]),
      min: minItem[metricField] as number,
      minLabel: String(minItem[dimensionField]),
      spread: Number(spread.toFixed(2)),
      totalPoints: records.length,
      distinctCategories: finalRecords.length,
    };
  }

  return {
    records: finalRecords,
    summary
  };
}
