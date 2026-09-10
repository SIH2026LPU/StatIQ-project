import { ChartSpec } from "@/lib/visualization/chart-schema";

export function getPieChartOption(spec: ChartSpec, baseOption: any): any {
  if (spec.type !== "pie" && spec.type !== "donut") return baseOption;

  const data = spec.data || [];
  if (data.length === 0) return baseOption;

  const categoryField = spec.labelField || Object.keys(data[0])[0];
  const valueField = spec.valueField || Object.keys(data[0]).filter(k => k !== categoryField)[0];

  const seriesData = data.map(item => ({
    name: item[categoryField],
    value: item[valueField]
  }));

  const isDonut = spec.type === "donut";

  baseOption.tooltip = {
    ...baseOption.tooltip,
    trigger: "item",
    formatter: "{a} <br/>{b}: {c} ({d}%)"
  };

  baseOption.series = [
    {
      name: valueField,
      type: "pie",
      radius: isDonut ? ["40%", "70%"] : "70%",
      itemStyle: {
        borderRadius: isDonut ? 10 : 0,
        borderColor: "#fff",
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: "{b}: {d}%"
      },
      data: seriesData,
    }
  ];

  // Remove axes for pie/donut
  delete baseOption.xAxis;
  delete baseOption.yAxis;

  return baseOption;
}
