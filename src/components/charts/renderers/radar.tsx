import { ChartSpec } from "@/lib/visualization/chart-schema";

export function getRadarChartOption(spec: ChartSpec, baseOption: any): any {
  if (spec.type !== "radar") return baseOption;

  const data = spec.data || [];
  if (data.length === 0) return baseOption;

  // Assuming data: [{ category: 'StateA', metric1: 10, metric2: 20 }, { category: 'StateB', metric1: 15, metric2: 25 }]
  const categoryField = spec.indicatorField || Object.keys(data[0])[0];
  const seriesDefinitions = spec.series || [];
  
  const dimensions = seriesDefinitions.length > 0
    ? seriesDefinitions.map(s => s.field!)
    : Object.keys(data[0]).filter(k => k !== categoryField);

  // Determine max values for indicators
  const indicators = dimensions.map(dim => {
    const maxVal = Math.max(...data.map(d => Number(d[dim]) || 0));
    return { name: dim, max: maxVal * 1.1 }; // 10% padding
  });

  baseOption.radar = {
    indicator: indicators,
    shape: "polygon", // or circle
  };

  const seriesData = data.map(row => ({
    value: dimensions.map(dim => row[dim]),
    name: row[categoryField],
  }));

  baseOption.series = [
    {
      name: "Radar Breakdown",
      type: "radar",
      data: seriesData,
    }
  ];

  // Radar charts do not use traditional x/y axes
  delete baseOption.xAxis;
  delete baseOption.yAxis;
  delete baseOption.dataZoom;

  return baseOption;
}
