import { ChartSpec } from "@/lib/visualization/chart-schema";

export function getLineChartOption(spec: ChartSpec, baseOption: any): any {
  if (spec.type !== "line" && spec.type !== "area" && spec.type !== "stacked_area") return baseOption;

  const data = spec.data || [];
  if (data.length === 0) return baseOption;

  const xAxisField = spec.xAxis?.field || Object.keys(data[0])[0];
  const seriesDefinitions = spec.series || [];
  
  // If no series defined, try to infer from data keys excluding xAxis
  const dimensions = seriesDefinitions.length > 0
    ? seriesDefinitions.map(s => s.field!)
    : Object.keys(data[0]).filter(k => k !== xAxisField);

  baseOption.dataset = { source: data };
  
  baseOption.xAxis = {
    ...baseOption.xAxis,
    type: spec.xAxis?.type || "category",
    name: spec.xAxis?.label,
  };

  baseOption.yAxis = {
    ...baseOption.yAxis,
    type: spec.yAxis?.type || "value",
    name: spec.yAxis?.label,
  };

  baseOption.series = dimensions.map((dim) => {
    const sDef = seriesDefinitions.find(s => s.field === dim);
    return {
      type: "line",
      name: sDef?.name || dim,
      encode: { x: xAxisField, y: dim },
      itemStyle: sDef?.color ? { color: sDef.color } : undefined,
      areaStyle: spec.type === "area" || spec.type === "stacked_area" ? {} : undefined,
      stack: spec.type === "stacked_area" ? "total" : undefined,
      smooth: true,
      symbol: data.length > 50 ? "none" : "circle",
    };
  });

  return baseOption;
}
