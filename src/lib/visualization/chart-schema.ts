import { z } from "zod";

export const ChartAxisSchema = z.object({
  field: z.string().optional(),
  label: z.string().optional(),
  type: z.enum(["category", "value", "time", "log"]).optional(),
  unit: z.string().optional(),
});

export const ChartSeriesSchema = z.object({
  name: z.string().optional(),
  field: z.string().optional(),
  type: z.enum([
    "line", "bar", "pie", "scatter", "radar", "heatmap", "treemap", "sunburst",
    "funnel", "gauge", "boxplot", "candlestick", "parallel", "sankey", "graph", "tree"
  ]).optional(),
  color: z.string().optional(),
  unit: z.string().optional(),
});

export const ChartSourceSchema = z.object({
  provider: z.string().optional(),
  dataset: z.string().optional(),
  mode: z.string().optional(), // LIVE, STORED, CACHED
  retrievedAt: z.string().optional(),
});

const BaseChartSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  data: z.array(z.record(z.string(), z.any())), // The actual rows of data
  legend: z.boolean().optional(),
  tooltip: z.boolean().optional(),
  zoom: z.boolean().optional(),
  source: ChartSourceSchema.optional(),
  unit: z.string().optional(),
});

export const CartesianChartSchema = BaseChartSchema.extend({
  type: z.enum(["line", "bar", "grouped_bar", "stacked_bar", "area", "stacked_area", "scatter"]),
  xAxis: ChartAxisSchema.optional(),
  yAxis: ChartAxisSchema.optional(),
  series: z.array(ChartSeriesSchema).optional(),
});

export const CircularChartSchema = BaseChartSchema.extend({
  type: z.enum(["pie", "donut"]),
  labelField: z.string().optional(),
  valueField: z.string().optional(),
});

export const RadarChartSchema = BaseChartSchema.extend({
  type: z.literal("radar"),
  indicatorField: z.string().optional(),
  series: z.array(ChartSeriesSchema).optional(),
});

export const HeatmapChartSchema = BaseChartSchema.extend({
  type: z.literal("heatmap"),
  xField: z.string().optional(),
  yField: z.string().optional(),
  valueField: z.string().optional(),
});

export const GenericChartSchema = BaseChartSchema.extend({
  type: z.enum([
    "treemap", "sunburst", "funnel", "gauge", "boxplot", 
    "histogram", "candlestick", "parallel", "sankey", "graph", "tree", "map", "pictorial_bar", "theme_river"
  ]),
  xAxis: ChartAxisSchema.optional(),
  yAxis: ChartAxisSchema.optional(),
  series: z.array(ChartSeriesSchema).optional(),
});

export const ChartSpecSchema = z.discriminatedUnion("type", [
  CartesianChartSchema,
  CircularChartSchema,
  RadarChartSchema,
  HeatmapChartSchema,
  GenericChartSchema,
]);

export type ChartSpec = z.infer<typeof ChartSpecSchema>;
export type ChartAxis = z.infer<typeof ChartAxisSchema>;
export type ChartSeries = z.infer<typeof ChartSeriesSchema>;
export type ChartSource = z.infer<typeof ChartSourceSchema>;
