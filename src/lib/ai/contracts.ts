import { z } from "zod";
import { ChartSpecSchema } from "@/lib/visualization/chart-schema";

/**
 * AnalysisPlan Schema
 * Generated during Groq Pass 1 (Planning & Intent Understanding)
 */
export const AnalysisIntentSchema = z.enum([
  "summary",
  "latest_value",
  "trend",
  "comparison",
  "ranking",
  "distribution",
  "change",
  "yoy",
  "mom",
  "cagr",
  "correlation",
  "anomaly",
  "forecast",
]);

export type AnalysisIntent = z.infer<typeof AnalysisIntentSchema>;

export const ChartTypeSchema = z.enum([
  "line",
  "bar",
  "area",
  "scatter",
  "donut",
  "table",
]);

export type ChartType = z.infer<typeof ChartTypeSchema>;

export const AnalysisPlanSchema = z.object({
  dataset: z.string().describe("Target official dataset ID or keyword (e.g. CPI, WPI, PLFS, IIP, ASI, NAS, ENERGY)"),
  intent: AnalysisIntentSchema.default("latest_value"),
  operation: z.string().describe("Descriptive operation (e.g. compare_rural_urban_inflation, time_series_trend)"),
  filters: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  period: z
    .object({
      label: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  metric: z.string().optional().describe("Primary numerical column to analyze (e.g. inflation_rate, index_value, unemployment_rate)"),
  dimensions: z.array(z.string()).default([]).describe("Grouping fields (e.g. sector, region, category, gender)"),
  aggregation: z.enum(["mean", "latest", "sum", "max", "min", "median"]).optional(),
  chartType: ChartTypeSchema.optional(),
  requiresOfficialData: z.boolean().default(true),
});

export type AnalysisPlan = z.infer<typeof AnalysisPlanSchema>;

/**
 * AnalysisResult Schema
 * The canonical output contract delivered to frontend renderers
 */
export const KeyFindingSchema = z.object({
  label: z.string(),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  change: z.string().nullable().optional(),
  status: z.enum(["up", "down", "neutral"]).optional(),
});

export type KeyFinding = z.infer<typeof KeyFindingSchema>;

export const AnalysisTableSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null(), z.boolean()]))),
});

export type AnalysisTable = z.infer<typeof AnalysisTableSchema>;

export const ChartIntentSchema = z.object({
  chartType: ChartTypeSchema,
  xField: z.string().optional(),
  yField: z.string().optional(),
  labelField: z.string().optional(),
  valueField: z.string().optional(),
  seriesField: z.string().optional(),
});

export type ChartIntent = z.infer<typeof ChartIntentSchema>;

export const AnalysisMethodologySchema = z.object({
  operation: z.string(),
  dataset: z.string(),
  metric: z.string(),
  filters: z.record(z.string(), z.unknown()).optional(),
  aggregation: z.string().optional(),
  formula: z.string().nullable().optional(),
  recordsUsed: z.number(),
});

export type AnalysisMethodology = z.infer<typeof AnalysisMethodologySchema>;

export const AnalysisEvidenceSchema = z.object({
  source: z.string(),
  sourceUrl: z.string().optional(),
  dataset: z.string(),
  datasetId: z.string(),
  retrievedAt: z.string(),
  recordsUsed: z.number(),
  mode: z.enum(["LIVE", "STORED", "CACHED"]).default("STORED"),
  filtersApplied: z.record(z.string(), z.unknown()).optional(),
});

export type AnalysisEvidence = z.infer<typeof AnalysisEvidenceSchema>;

export const ExecutionTraceSchema = z.object({
  stage: z.string(),
  details: z.string(),
  durationMs: z.number(),
});

export type ExecutionTrace = z.infer<typeof ExecutionTraceSchema>;

export const AnalysisResultSchema = z.object({
  success: z.boolean(),
  answer: z.string().describe("Natural language explanation based strictly on validated official data"),
  title: z.string().describe("Clear descriptive title for the analysis report"),
  dataset: z.object({
    id: z.string(),
    name: z.string(),
    source: z.string(),
  }),
  period: z
    .object({
      label: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  keyFindings: z.array(KeyFindingSchema),
  table: AnalysisTableSchema.optional(),
  chart: ChartSpecSchema.optional(),
  methodology: AnalysisMethodologySchema,
  evidence: AnalysisEvidenceSchema,
  limitations: z.array(z.string()).optional(),
  executionTrace: z.array(ExecutionTraceSchema).optional(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
