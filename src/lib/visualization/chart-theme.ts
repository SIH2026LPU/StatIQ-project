import * as echarts from "echarts/core";

export const statiqColors = [
  "#10b981", // Emerald/Green
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

const sharedTheme = {
  color: statiqColors,
  textStyle: {
    fontFamily: "Inter, sans-serif",
  },
  title: {
    textStyle: {
      fontWeight: 600,
      fontSize: 16,
    },
    subtextStyle: {
      fontSize: 12,
    },
  },
  legend: {
    textStyle: {
      fontSize: 12,
    },
    pageTextStyle: {
      fontSize: 12,
    },
  },
  tooltip: {
    backgroundColor: "rgba(0,0,0,0.8)",
    textStyle: {
      color: "#fff",
    },
    borderWidth: 0,
    padding: [8, 12],
    borderRadius: 8,
  },
};

export const registerStatiqThemes = () => {
  // Light Theme
  echarts.registerTheme("statiq-light", {
    ...sharedTheme,
    backgroundColor: "transparent",
    textStyle: {
      ...sharedTheme.textStyle,
      color: "#374151", // gray-700
    },
    title: {
      textStyle: {
        color: "#111827", // gray-900
      },
      subtextStyle: {
        color: "#6b7280", // gray-500
      },
    },
    legend: {
      textStyle: {
        color: "#4b5563", // gray-600
      },
    },
    categoryAxis: {
      axisLine: { show: true, lineStyle: { color: "#e5e7eb" } },
      axisTick: { show: false },
      axisLabel: { color: "#6b7280" },
      splitLine: { show: false },
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#6b7280" },
      splitLine: { show: true, lineStyle: { color: "#f3f4f6", type: "dashed" } },
    },
  });

  // Dark Theme
  echarts.registerTheme("statiq-dark", {
    ...sharedTheme,
    backgroundColor: "transparent",
    textStyle: {
      ...sharedTheme.textStyle,
      color: "#d1d5db", // gray-300
    },
    title: {
      textStyle: {
        color: "#f9fafb", // gray-50
      },
      subtextStyle: {
        color: "#9ca3af", // gray-400
      },
    },
    legend: {
      textStyle: {
        color: "#d1d5db", // gray-300
      },
    },
    categoryAxis: {
      axisLine: { show: true, lineStyle: { color: "#374151" } },
      axisTick: { show: false },
      axisLabel: { color: "#9ca3af" },
      splitLine: { show: false },
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#9ca3af" },
      splitLine: { show: true, lineStyle: { color: "#1f2937", type: "dashed" } },
    },
    tooltip: {
      ...sharedTheme.tooltip,
      backgroundColor: "rgba(31, 41, 55, 0.95)", // gray-800
      borderColor: "#374151",
      borderWidth: 1,
    },
  });
};
