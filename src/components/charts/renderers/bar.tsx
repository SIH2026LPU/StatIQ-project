import { ChartSpec } from "@/lib/visualization/chart-schema";

export function getBarChartOption(spec: ChartSpec, baseOption: any): any {
  if (spec.type !== "bar" && spec.type !== "grouped_bar" && spec.type !== "stacked_bar") return baseOption;

  const data = spec.data || [];
  if (data.length === 0) return baseOption;

  const xAxisField = spec.xAxis?.field || Object.keys(data[0])[0];
  const seriesDefinitions = spec.series || [];
  
  const dimensions = seriesDefinitions.length > 0
    ? seriesDefinitions.map(s => s.field!)
    : Object.keys(data[0]).filter(k => k !== xAxisField);

  baseOption.dataset = { source: data };
  
  const isHorizontal = spec.xAxis?.type === "value";

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

  const isStacked = spec.type === "stacked_bar";

  const categoryField = isHorizontal ? (spec.yAxis?.field || xAxisField) : xAxisField;

  baseOption.series = dimensions.map((dim) => {
    const sDef = seriesDefinitions.find(s => s.field === dim);
    return {
      type: "bar",
      name: sDef?.name || dim,
      encode: isHorizontal
        ? { x: dim, y: categoryField }
        : { x: categoryField, y: dim },
      stack: isStacked ? "total" : undefined,
      itemStyle: sDef?.color ? { color: sDef.color } : undefined,
    };
  });

  return baseOption;
}
