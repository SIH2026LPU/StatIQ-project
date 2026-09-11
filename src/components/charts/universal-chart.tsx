"use client";

import React, { useMemo, useState } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  HeatmapChart,
  RadarChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  DatasetComponent,
} from "echarts/components";
import { useTheme } from "@/components/theme-provider";
import { ChartSpec } from "@/lib/visualization/chart-schema";
import { validateChartSpec } from "@/lib/visualization/chart-validation";
import { ChartDataNormalizer } from "@/lib/visualization/chart-normalizer";
import { registerStatiqThemes } from "@/lib/visualization/chart-theme";
import { getLineChartOption } from "./renderers/line";
import { getBarChartOption } from "./renderers/bar";
import { getPieChartOption } from "./renderers/pie";
import { getScatterChartOption } from "./renderers/scatter";
import { getHeatmapChartOption } from "./renderers/heatmap";
import { getRadarChartOption } from "./renderers/radar";

// Register ECharts core components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  DatasetComponent,
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  HeatmapChart,
  RadarChart,
]);

// Register our themes
if (typeof window !== "undefined") {
  registerStatiqThemes();
}

interface UniversalChartProps {
  spec: ChartSpec;
  className?: string;
  height?: number | string;
}

export function UniversalChart({ spec, className = "", height = 400 }: UniversalChartProps) {
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const themeName = resolvedTheme === "dark" ? "statiq-dark" : "statiq-light";

  // Validate and normalize spec on change
  const processedSpec = useMemo(() => {
    try {
      setError(null);
      const normalizedSpec = ChartDataNormalizer.normalizeChartSpec(spec);
      const validSpec = validateChartSpec(normalizedSpec);
      const normalizedData = ChartDataNormalizer.normalizeRecords(validSpec.data);
      return { ...validSpec, data: normalizedData };
    } catch (e: any) {
      setError(e.message || "Failed to validate chart specification.");
      return null;
    }
  }, [spec]);

  // Derive ECharts option from spec
  const option = useMemo(() => {
    if (!processedSpec) return {};

    // Base option shared across all
    const baseOption: any = {
      title: {
        text: processedSpec.title,
        subtext: processedSpec.subtitle,
        left: "center",
      },
      tooltip: {
        show: processedSpec.tooltip !== false,
        trigger: "axis", // default, may be overridden by specific charts
      },
      legend: {
        show: processedSpec.legend !== false,
        bottom: 0,
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: { show: true, title: "Save" },
          dataView: { show: true, title: "Data View", readOnly: true },
        },
      },
      dataZoom: processedSpec.zoom ? [
        { type: "inside" },
        { type: "slider", bottom: 30 }
      ] : [],
    };

    // Delegate to specific renderers
    switch (processedSpec.type) {
      case "line":
      case "area":
      case "stacked_area":
        return getLineChartOption(processedSpec, baseOption);
      case "bar":
      case "grouped_bar":
      case "stacked_bar":
        return getBarChartOption(processedSpec, baseOption);
      case "pie":
      case "donut":
        return getPieChartOption(processedSpec, baseOption);
      case "scatter":
        return getScatterChartOption(processedSpec, baseOption);
      case "heatmap":
        return getHeatmapChartOption(processedSpec, baseOption);
      case "radar":
        return getRadarChartOption(processedSpec, baseOption);
      default:
        // Fallback for types we haven't implemented specific renderers for yet
        return getBarChartOption(processedSpec, baseOption);
    }
  }, [processedSpec]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-destructive/10 text-destructive rounded-lg border border-destructive/20 p-4 ${className}`} style={{ height }}>
        <div className="text-center">
          <p className="font-semibold mb-1">Visualization Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!processedSpec || !processedSpec.data || processedSpec.data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted/30 text-muted-foreground rounded-lg border border-border border-dashed ${className}`} style={{ height }}>
        <p>NO OFFICIAL DATA FOUND</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        theme={themeName}
        notMerge={true}
        lazyUpdate={true}
        style={{ height: "100%", width: "100%" }}
      />
      {processedSpec.source && (
        <div className="absolute bottom-0 right-0 text-xs text-muted-foreground opacity-60 pointer-events-none pb-1 pr-2">
          Source: {processedSpec.source.provider} {processedSpec.source.dataset ? `(${processedSpec.source.dataset})` : ""}
          {processedSpec.source.mode === "LIVE" && " • LIVE"}
        </div>
      )}
    </div>
  );
}
