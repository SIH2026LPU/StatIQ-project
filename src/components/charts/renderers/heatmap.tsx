import { ChartSpec } from "@/lib/visualization/chart-schema";

export function getHeatmapChartOption(spec: ChartSpec, baseOption: any): any {
  if (spec.type !== "heatmap") return baseOption;

  const data = spec.data || [];
  if (data.length === 0) return baseOption;

  // Assuming data comes as flat array: [{ xCat, yCat, value }]
  const xAxisField = spec.xField || Object.keys(data[0])[0];
  const yAxisField = spec.yField || Object.keys(data[0])[1];
  const valueField = spec.valueField || Object.keys(data[0])[2];

  // Extract unique categories for X and Y axes
  const xCategories = Array.from(new Set(data.map(d => d[xAxisField])));
  const yCategories = Array.from(new Set(data.map(d => d[yAxisField])));

  // Map data to the format ECharts heatmap expects: [xIndex, yIndex, value]
  const seriesData = data.map(d => [
    xCategories.indexOf(d[xAxisField]),
    yCategories.indexOf(d[yAxisField]),
    d[valueField] || 0
  ]);

  baseOption.tooltip = {
    ...baseOption.tooltip,
    position: "top"
  };

  baseOption.grid = {
    height: "70%",
    top: "10%"
  };

  baseOption.xAxis = {
    type: "category",
    data: xCategories,
    splitArea: {
      show: true
    }
  };

  baseOption.yAxis = {
    type: "category",
    data: yCategories,
    splitArea: {
      show: true
    }
  };

  baseOption.visualMap = {
    min: Math.min(...seriesData.map(d => d[2] as number)),
    max: Math.max(...seriesData.map(d => d[2] as number)),
    calculable: true,
    orient: "horizontal",
    left: "center",
    bottom: "0%" // visualmap at bottom above legend
  };

  baseOption.series = [
    {
      name: valueField,
      type: "heatmap",
      data: seriesData,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.5)"
        }
      }
    }
  ];

  return baseOption;
}
