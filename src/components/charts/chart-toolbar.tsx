"use client";

import React from "react";
import { ChartSpec } from "@/lib/visualization/chart-schema";
import { Maximize2, Download, Table, BarChart2, LineChart, PieChart } from "lucide-react";

interface ChartToolbarProps {
  spec: ChartSpec;
  onTypeChange?: (type: ChartSpec["type"]) => void;
  onToggleFullscreen?: () => void;
  onToggleTableView?: () => void;
  onDownload?: () => void;
}

export function ChartToolbar({
  spec,
  onTypeChange,
  onToggleFullscreen,
  onToggleTableView,
  onDownload,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between w-full p-2 border-b border-outline-variant/30 bg-surface-container-high/20 rounded-t-2xl">
      <div className="flex items-center space-x-1">
        {onTypeChange && (
          <>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                spec.type === "line"
                  ? "bg-primary-container text-black font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
              onClick={() => onTypeChange("line")}
              title="Line Chart"
            >
              <LineChart className="w-3.5 h-3.5" />
              Line
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                spec.type === "bar"
                  ? "bg-primary-container text-black font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
              onClick={() => onTypeChange("bar")}
              title="Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Bar
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                spec.type === "pie"
                  ? "bg-primary-container text-black font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
              onClick={() => onTypeChange("pie")}
              title="Pie Chart"
            >
              <PieChart className="w-3.5 h-3.5" />
              Pie
            </button>
          </>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {onToggleTableView && (
          <button 
            type="button"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            onClick={onToggleTableView} 
            title="View Data Table"
          >
            <Table className="w-4 h-4" />
          </button>
        )}
        {onDownload && (
          <button 
            type="button"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            onClick={onDownload} 
            title="Download Chart"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        {onToggleFullscreen && (
          <button 
            type="button"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            onClick={onToggleFullscreen} 
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
