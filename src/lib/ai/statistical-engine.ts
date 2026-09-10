import type { OfficialDataset, OfficialRecord } from "@/db/official-store";
import type {
  AnalysisPlan,
  AnalysisTable,
  AnalysisMethodology,
  AnalysisEvidence,
  KeyFinding,
} from "./contracts";
import type { ChartSpec } from "@/lib/visualization/chart-schema";
import { aggregateRecords } from "@/lib/visualization/analysis-engine";

export interface DeterministicAnalysisOutput {
  title: string;
  keyFindings: KeyFinding[];
  table?: AnalysisTable;
  chart?: ChartSpec;
  methodology: AnalysisMethodology;
  evidence: AnalysisEvidence;
  limitations: string[];
  recordsUsedCount: number;
  computedSummaryData: Record<string, unknown>;
}

/**
 * Generic Deterministic Statistical Execution Engine
 * Executes any validated AnalysisPlan against official records.
 */
export function executePlanAnalysis(
  plan: AnalysisPlan,
  dataset: OfficialDataset,
  records: OfficialRecord[],
  mode: "LIVE" | "STORED" | "CACHED" = "STORED"
): DeterministicAnalysisOutput {
  const recordsUsed = records.map((r) => r.payload);
  const totalCount = recordsUsed.length;

  if (totalCount === 0) {
    return {
      title: `${dataset.name} Analysis`,
      keyFindings: [],
      methodology: {
        operation: plan.operation || plan.intent,
        dataset: dataset.name,
        metric: plan.metric || "N/A",
        recordsUsed: 0,
      },
      evidence: {
        source: dataset.source,
        sourceUrl: dataset.sourceUrl,
        dataset: dataset.name,
        datasetId: dataset.id,
        retrievedAt: new Date().toISOString(),
        recordsUsed: 0,
        mode,
      },
      limitations: ["No official records found matching the requested query filters."],
      recordsUsedCount: 0,
      computedSummaryData: {},
    };
  }

  // 1. Resolve primary numeric metric
  let metricKey = plan.metric;
  if (!metricKey) {
    const firstRow = recordsUsed[0];
    metricKey = Object.keys(firstRow).find(
      (k) =>
        k !== "weight" &&
        k !== "sample_households" &&
        typeof firstRow[k] === "number" &&
        !isNaN(firstRow[k] as number)
    );
  }
  if (!metricKey) metricKey = "index_value";

  // 2. Resolve primary grouping dimension
  let dimKey = plan.dimensions[0];
  if (!dimKey) {
    const firstRow = recordsUsed[0];
    dimKey =
      Object.keys(firstRow).find(
        (k) =>
          (k === "sector" ||
            k === "region" ||
            k === "majorgroup" ||
            k === "category" ||
            k === "item" ||
            k === "state") &&
          typeof firstRow[k] === "string"
      ) || "period";
  }

  const keyFindings: KeyFinding[] = [];
  const limitations: string[] = [];
  let chart: ChartSpec | undefined;
  let table: AnalysisTable | undefined;
  let formula: string | null = null;

  // Build standard tabular representation
  const allKeys = Array.from(
    new Set(recordsUsed.flatMap((r) => Object.keys(r)))
  ).filter((k) => k !== "id" && k !== "datasetId");

  table = {
    columns: allKeys.slice(0, 7),
    rows: recordsUsed.slice(0, 15) as any,
  };

  // -------------------------------------------------------------------------
  // CASE A: COMPARISON (e.g. Rural vs Urban, State A vs State B, Groups)
  // -------------------------------------------------------------------------
  if (
    plan.intent === "comparison" ||
    plan.operation.toLowerCase().includes("rural_urban") ||
    plan.operation.toLowerCase().includes("compare")
  ) {
    const { records: aggregatedRows } = aggregateRecords(
      recordsUsed,
      dimKey,
      metricKey,
      "avg",
      0,
      "desc"
    );

    table = {
      columns: [dimKey, metricKey, "_aggregated_count"],
      rows: aggregatedRows.slice(0, 15) as any,
    };

    const comparisonEntries = aggregatedRows.map(r => ({
      label: String(r[dimKey]),
      value: Number(r[metricKey]),
      unit: metricKey.includes("rate") || metricKey.includes("percentage") || metricKey.includes("inflation") ? "%" : "Index"
    }));

    for (const entry of comparisonEntries) {
      keyFindings.push({
        label: `${entry.label} ${formatMetricLabel(metricKey)}`,
        value: entry.value,
        unit: entry.unit,
        status: entry.value >= 5 ? "up" : "neutral",
      });
    }

    if (comparisonEntries.length >= 2) {
      const g1 = comparisonEntries[0];
      const g2 = comparisonEntries[1];
      const diff = Number(Math.abs(g1.value - g2.value).toFixed(2));
      const higher = g1.value >= g2.value ? g1.label : g2.label;
      const diffUnit = g1.unit === "%" ? "percentage points" : "points";

      keyFindings.push({
        label: `${higher} Premium / Gap`,
        value: diff,
        unit: diffUnit,
        change: `${higher} exceeds by ${diff} ${diffUnit}`,
        status: diff > 0 ? "up" : "neutral",
      });
      formula = `Difference = |${g1.label} (${g1.value}) - ${g2.label} (${g2.value})| = ${diff} ${diffUnit}`;
    }

    chart = {
      type: (plan.chartType === "table" ? "bar" : plan.chartType ?? "bar") as any,
      title: `${dataset.name} — ${formatMetricLabel(metricKey)} Comparison`,
      xAxis: { field: dimKey, type: "category" },
      yAxis: { field: metricKey, type: "value" },
      unit: comparisonEntries[0]?.unit ?? "Value",
      data: aggregatedRows,
      series: [{ field: metricKey, name: metricKey }],
    } as any;
  }
  // -------------------------------------------------------------------------
  // CASE B: TIME SERIES / TREND / YoY / MoM
  // -------------------------------------------------------------------------
  else if (
    plan.intent === "trend" ||
    plan.intent === "yoy" ||
    plan.intent === "mom" ||
    plan.intent === "cagr" ||
    plan.intent === "change"
  ) {
    const series = recordsUsed
      .map((row) => {
        const rawVal =
          row[metricKey] ??
          row.index_value ??
          row.value ??
          row.inflation_rate ??
          row.cpi_general;
        const val =
          typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal ?? "0")) || 0;
        const periodStr = String(
          row.period ??
            (row.month && row.year ? `${row.month} ${row.year}` : row.year ?? "N/A")
        );
        return {
          ...row,
          period: periodStr,
          [metricKey]: Number(val.toFixed(2)),
        };
      })
      .filter((s) => (s[metricKey] as number) > 0);

    const values = series.map((s) => s[metricKey] as number);
    const count = values.length;

    table = {
      columns: ["period", metricKey, dimKey].filter(k => series.length > 0 && series[0].hasOwnProperty(k)),
      rows: series.slice(0, 15) as any,
    };

    if (count > 0) {
      const first = values[0];
      const latest = values[count - 1];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = values.reduce((a, b) => a + b, 0) / count;
      const pctChange = first > 0 ? Number((((latest - first) / first) * 100).toFixed(2)) : 0;

      const peakItem = series.find((s) => s[metricKey] === max);
      const troughItem = series.find((s) => s[metricKey] === min);

      keyFindings.push({
        label: "Latest Observation",
        value: latest,
        change: `${pctChange >= 0 ? "+" : ""}${pctChange}% cumulative change`,
        status: pctChange >= 0 ? "up" : "down",
      });

      keyFindings.push({
        label: "Historical High",
        value: max,
        change: `Peak recorded in ${peakItem?.period || "series"}`,
        status: "neutral",
      });

      keyFindings.push({
        label: "Historical Low",
        value: min,
        change: `Trough recorded in ${troughItem?.period || "series"}`,
        status: "neutral",
      });

      keyFindings.push({
        label: "Arithmetic Mean",
        value: Number(mean.toFixed(2)),
        change: `Sample size n=${count} records`,
        status: "neutral",
      });

      formula = `Percentage Change = ((Latest [${latest}] - Initial [${first}]) / Initial [${first}]) × 100 = ${pctChange}%`;

      chart = {
        type: (plan.chartType === "table" ? "line" : plan.chartType ?? "line") as any,
        title: `${dataset.name} — Chronological Series Trend`,
        xAxis: { field: "period", type: "category" },
        yAxis: { field: metricKey, type: "value" },
        unit: metricKey.includes("inflation") ? "%" : "Index",
        data: series,
        series: [{ field: metricKey, name: metricKey }],
      } as any;
    }
  }
  // -------------------------------------------------------------------------
  // CASE C: RANKING / DISTRIBUTION / SUMMARY
  // -------------------------------------------------------------------------
  else {
    const numericVals = recordsUsed
      .map((r) => {
        const raw = r[metricKey] ?? r.index_value ?? r.value ?? r.unemployment_rate;
        return typeof raw === "number" ? raw : parseFloat(String(raw ?? "0")) || 0;
      })
      .filter((n) => n > 0);

    if (numericVals.length > 0) {
      const sum = numericVals.reduce((a, b) => a + b, 0);
      const mean = sum / numericVals.length;
      const sorted = [...numericVals].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];

      keyFindings.push({
        label: `Mean ${formatMetricLabel(metricKey)}`,
        value: Number(mean.toFixed(2)),
        change: `Calculated across ${numericVals.length} observations`,
        status: "neutral",
      });

      keyFindings.push({
        label: "Maximum Observed",
        value: max,
        status: "up",
      });

      keyFindings.push({
        label: "Minimum Observed",
        value: min,
        status: "down",
      });

      const { records: chartData } = aggregateRecords(recordsUsed, dimKey, metricKey, "avg", 10, "desc");

      table = {
        columns: [dimKey, metricKey, "_aggregated_count"],
        rows: chartData as any,
      };

      chart = {
        type: (plan.chartType === "table" ? "bar" : plan.chartType ?? "bar") as any,
        title: `${dataset.name} — ${formatMetricLabel(metricKey)} Summary`,
        xAxis: { field: dimKey, type: "category" },
        yAxis: { field: metricKey, type: "value" },
        data: chartData,
        series: [{ field: metricKey, name: metricKey }],
      } as any;
    }
  }

  return {
    title: `${dataset.name} — ${formatMetricLabel(metricKey)} Analysis`,
    keyFindings,
    table,
    chart,
    methodology: {
      operation: plan.operation || plan.intent,
      dataset: dataset.name,
      metric: metricKey,
      filters: plan.filters,
      aggregation: plan.aggregation || "deterministic arithmetic",
      formula,
      recordsUsed: totalCount,
    },
    evidence: {
      source: dataset.source,
      sourceUrl: dataset.sourceUrl,
      dataset: dataset.name,
      datasetId: dataset.id,
      retrievedAt: new Date().toISOString(),
      recordsUsed: totalCount,
      mode,
      filtersApplied: plan.filters,
    },
    limitations,
    recordsUsedCount: totalCount,
    computedSummaryData: {
      keyFindings,
      metricKey,
      dimKey,
      totalCount,
    },
  };
}

function formatMetricLabel(metric: string): string {
  return metric
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Percentage", "(%)")
    .replace("Rate", "Rate (%)");
}

export function calculateDescriptiveStats(numbers: number[]) {
  const valid = numbers.filter((n) => typeof n === "number" && !isNaN(n) && isFinite(n));
  if (valid.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, min: 0, max: 0, range: 0, variance: 0, stdDev: 0, q1: 0, q3: 0, iqr: 0 };
  }
  const count = valid.length;
  const sum = valid.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;
  const sorted = [...valid].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const variance = valid.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  return {
    count,
    sum: Number(sum.toFixed(4)),
    mean: Number(mean.toFixed(4)),
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    range: Number((max - min).toFixed(4)),
    variance: Number(variance.toFixed(4)),
    stdDev: Number(Math.sqrt(variance).toFixed(4)),
  };
}

export function calculateTimeSeriesGrowth(rawSeries: Array<{ period: string; value: number }>) {
  const valid = rawSeries.filter((item) => typeof item.value === "number" && !isNaN(item.value) && isFinite(item.value));
  if (valid.length === 0) return null;
  const first = valid[0];
  const latest = valid[valid.length - 1];
  const pctChange = first.value !== 0 ? Number((((latest.value - first.value) / first.value) * 100).toFixed(2)) : 0;
  return {
    firstPeriod: first.period,
    firstValue: first.value,
    latestPeriod: latest.period,
    latestValue: latest.value,
    percentageChange: pctChange,
    periodCount: valid.length,
    series: valid,
  };
}

export function buildChartSpecification(
  data: Array<Record<string, unknown>>,
  options: { title: string; subtitle?: string; xKey: string; yKey: string; type?: any; unit?: string; color?: string }
): ChartSpec {
  return {
    type: options.type ?? "line",
    title: options.title,
    subtitle: options.subtitle,
    xAxis: { field: options.xKey, type: "category" },
    yAxis: { field: options.yKey, type: "value" },
    unit: options.unit,
    data,
  } as ChartSpec;
}
