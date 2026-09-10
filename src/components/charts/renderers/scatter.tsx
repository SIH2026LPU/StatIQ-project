import { ChartSpec } from "@/lib/visualization/chart-schema";

export function getScatterChartOption(spec: ChartSpec, baseOption: any): any {
  if (spec.type !== "scatter") return baseOption;
  
  const data = spec.data || [];
  if (data.length === 0) return baseOption;

  const xAxisField = spec.xAxis?.field || Object.keys(data[0])[0];
  const yAxisField = spec.yAxis?.field || Object.keys(data[0])[1];

  baseOption.dataset = { source: data };

  baseOption.xAxis = {
    ...baseOption.xAxis,
    type: spec.xAxis?.type || "value", // Scatters are often value vs value
    name: spec.xAxis?.label,
  };

  baseOption.yAxis = {
    ...baseOption.yAxis,
    type: spec.yAxis?.type || "value",
    name: spec.yAxis?.label,
  };

  baseOption.series = [
    {
      type: "scatter",
      name: spec.series?.[0]?.name || `${xAxisField} vs ${yAxisField}`,
      encode: { x: xAxisField, y: yAxisField },
      symbolSize: 10,
    }
  ];

  return baseOption;
}
