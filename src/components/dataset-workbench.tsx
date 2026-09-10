"use client";

import { useMemo, useState, useEffect } from "react";
import type { OfficialDataset, OfficialRecord } from "@/db/official-store";
import type { DataSourceMode } from "@/lib/official-data-client";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Table as TableIcon,
  Layers,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Download,
  Info,
  Sparkles,
  Code2,
  SlidersHorizontal,
  AlignLeft,
  Activity,
  Maximize2,
} from "lucide-react";
import { UniversalChart } from "@/components/charts/universal-chart";
import { ChartSpec } from "@/lib/visualization/chart-schema";
import { aggregateRecords } from "@/lib/visualization/analysis-engine";
import Link from "next/link";

type Tab = "charts" | "overview" | "data" | "metadata" | "source";
type ChartType = "bar" | "horizontal_bar" | "area" | "pie" | "line";
type AggType = "avg" | "sum" | "max" | "count";

const STITCH_CHART_COLORS = [
  "#10b981", // Emerald Glow
  "#00dbe9", // Electric Cyan
  "#d05bff", // Neon Purple
  "#f59e0b", // Warm Amber
  "#6366f1", // Deep Indigo
  "#ec4899", // Vivid Pink
  "#14b8a6", // Bright Teal
  "#8b5cf6", // Royal Violet
  "#38bdf8", // Sky Blue
  "#fb7185", // Rose Coral
  "#a3e635", // Lime Green
  "#e879f9", // Fuchsia
];

const NON_MEASUREMENT_COLS = new Set([
  "year",
  "month",
  "month_code",
  "code",
  "id",
  "serial",
  "page",
  "limit",
  "status",
  "statusCode",
  "externalId",
  "datasetId",
  "source",
  "sourceUrl",
  "retrievedAt",
]);

export function DatasetWorkbench({
  dataset,
  records: incomingRecords,
  preview: incomingPreview,
  total: incomingTotal,
  liveTotal,
  dataMode = "METADATA_ONLY",
  liveRetrievedAt,
}: {
  dataset: OfficialDataset;
  records: OfficialRecord[];
  preview: OfficialRecord[];
  total: number;
  liveTotal?: number;
  dataMode?: DataSourceMode;
  liveRetrievedAt?: string;
}) {
  const [tab, setTab] = useState<Tab>("charts");
  const [copiedMeta, setCopiedMeta] = useState(false);

  const activeRecords = incomingRecords.length > 0 ? incomingRecords : incomingPreview;

  // Extract all columns
  const columns = useMemo(() => {
    const set = new Set<string>();
    for (const r of activeRecords) {
      if (r && r.payload) {
        for (const k of Object.keys(r.payload)) {
          if (r.payload[k] !== undefined) set.add(k);
        }
      }
    }
    return [...set];
  }, [activeRecords]);

  // Compute distinct cardinality per column to identify constants vs varied dimensions
  const columnCardinality = useMemo(() => {
    const map = new Map<string, number>();
    for (const col of columns) {
      const distinct = new Set<string>();
      for (const r of activeRecords) {
        const val = r.payload?.[col];
        if (val !== undefined && val !== null && val !== "") {
          distinct.add(String(val));
        }
      }
      map.set(col, distinct.size);
    }
    return map;
  }, [columns, activeRecords]);

  // Extract genuine measurement / metric columns (prioritizing index_value, value, rate over year/month)
  const numericColumns = useMemo(() => {
    const validNumeric = columns.filter((col) => {
      let count = 0;
      for (const r of activeRecords) {
        const v = r.payload?.[col];
        if (typeof v === "number" && Number.isFinite(v)) count++;
        else if (typeof v === "string" && !isNaN(Number(v)) && v.trim() !== "") count++;
      }
      return count > 0;
    });

    // Sort so genuine statistical measures appear before identifier/time dimensions
    return validNumeric.sort((a, b) => {
      const aIsNonMetric = NON_MEASUREMENT_COLS.has(a);
      const bIsNonMetric = NON_MEASUREMENT_COLS.has(b);
      if (aIsNonMetric !== bIsNonMetric) return aIsNonMetric ? 1 : -1;
      const priority = ["index_value", "value", "rate", "gva", "score", "amount", "total", "index", "production", "count", "weight"];
      const aIdx = priority.indexOf(a);
      const bIdx = priority.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [columns, activeRecords]);

  // Extract categorical dimension columns (prioritizing columns with cardinality > 1)
  const dimensionColumns = useMemo(() => {
    return [...columns].sort((a, b) => {
      const cardA = columnCardinality.get(a) ?? 0;
      const cardB = columnCardinality.get(b) ?? 0;
      // Dimensions with cardinality > 1 should be preferred
      const aIsConstant = cardA <= 1;
      const bIsConstant = cardB <= 1;
      if (aIsConstant !== bIsConstant) return aIsConstant ? 1 : -1;

      // Priority list for meaningful categorical breakdown
      const priority = ["item", "majorgroup", "group", "subgroup", "sub_subgroup", "category", "state", "sector", "indicator", "month", "year"];
      const aIdx = priority.indexOf(a);
      const bIdx = priority.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return cardB - cardA;
    });
  }, [columns, columnCardinality]);

  // Chart state
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [aggType, setAggType] = useState<AggType>("avg");
  const [limitCount, setLimitCount] = useState<number>(15);
  const [sortOrderChoice, setSortOrderChoice] = useState<"desc" | "asc" | "natural">("desc");

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Auto-initialize intelligent default dimension and metric
  useEffect(() => {
    if (columns.length > 0) {
      if (!selectedDimension || !columns.includes(selectedDimension)) {
        // Choose the highest-ranked dimension with cardinality > 1
        const bestDim = dimensionColumns.find((d) => (columnCardinality.get(d) ?? 0) > 1) ?? dimensionColumns[0] ?? columns[0];
        setSelectedDimension(bestDim);
      }
      if (!selectedMetric || !numericColumns.includes(selectedMetric)) {
        // Choose genuine measurement column (index_value, value, etc.)
        const bestMetric = numericColumns.find((m) => !NON_MEASUREMENT_COLS.has(m)) ?? numericColumns[0] ?? columns[0];
        setSelectedMetric(bestMetric);
      }
    }
  }, [columns, numericColumns, dimensionColumns, columnCardinality, selectedDimension, selectedMetric]);

  // Preset switchers
  const applyPreset = (dim: string, metric: string, type: ChartType) => {
    if (columns.includes(dim)) setSelectedDimension(dim);
    if (numericColumns.includes(metric)) setSelectedMetric(metric);
    setChartType(type);
  };

  // Prepare aggregated Chart Data and Summary
  const { records: chartData, summary: summaryStats } = useMemo(() => {
    return aggregateRecords(
      activeRecords,
      selectedDimension,
      selectedMetric,
      aggType,
      limitCount,
      sortOrderChoice
    );
  }, [activeRecords, selectedDimension, selectedMetric, aggType, limitCount, sortOrderChoice]);

  // Filtered & Sorted Table Rows
  const filteredRows = useMemo(() => {
    let rows = [...activeRecords];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((row) => {
        if (row.externalId?.toLowerCase().includes(q)) return true;
        return Object.values(row.payload ?? {}).some((val) => val != null && String(val).toLowerCase().includes(q));
      });
    }

    if (sortColumn) {
      rows.sort((a, b) => {
        const valA = sortColumn === "externalId" ? a.externalId : a.payload?.[sortColumn];
        const valB = sortColumn === "externalId" ? b.externalId : b.payload?.[sortColumn];
        if (valA == null) return 1;
        if (valB == null) return -1;
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }
        return sortOrder === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }, [activeRecords, searchQuery, sortColumn, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  // Export handlers
  const handleExportCSV = () => {
    if (activeRecords.length === 0) return;
    const headers = ["external_id", ...columns];
    const csvLines = [
      headers.join(","),
      ...activeRecords.map((r) => {
        const row = [r.externalId, ...columns.map((c) => JSON.stringify(r.payload?.[c] ?? ""))];
        return row.join(",");
      }),
    ];
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dataset.id || "dataset"}-official-records.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (activeRecords.length === 0) return;
    const blob = new Blob([JSON.stringify(activeRecords, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dataset.id || "dataset"}-official-records.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMetadata = () => {
    navigator.clipboard.writeText(JSON.stringify(dataset, null, 2));
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2500);
  };

  const displayTotal = dataMode === "ERROR" ? null : liveTotal && liveTotal > 0 ? liveTotal : incomingTotal;

  // Custom Stitch Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const val = item.payload?.[selectedMetric];
    const full = item.payload?.[selectedDimension] || label;
    const count = item.payload?._aggregated_count;

    return (
      <div className="glass-panel p-3.5 rounded-xl border border-outline-variant/40 shadow-2xl bg-surface-container-high/95 backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between gap-2 border-b border-outline-variant/20 pb-1.5">
          <span className="font-semibold text-on-surface truncate max-w-[170px]" title={full}>
            {full}
          </span>
          <span className="text-[10px] font-label-caps px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-fixed-dim font-mono uppercase">
            {aggType}
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-on-surface-variant text-[11px] font-label-caps">{selectedMetric}:</span>
          <span className="font-mono font-bold text-sm text-primary">
            {typeof val === "number" ? val.toLocaleString() : val}
          </span>
        </div>
        {count != null && count > 1 && (
          <div className="text-[10px] text-on-surface-variant flex justify-between">
            <span>Aggregated Records:</span>
            <span className="font-mono font-semibold text-on-surface">{count} rows</span>
          </div>
        )}
        {summaryStats && (
          <div className="text-[10px] text-on-surface-variant/80 pt-1 border-t border-outline-variant/15 flex justify-between">
            <span>vs Benchmark Avg:</span>
            <span className={Number(val) >= Number(summaryStats.avg) ? "text-emerald-500 font-mono font-semibold" : "text-amber-500 font-mono font-semibold"}>
              {(((Number(val) - Number(summaryStats.avg)) / (Number(summaryStats.avg) || 1)) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner if Live Stream Error */}
      {dataMode === "ERROR" ? (
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-sm flex items-center gap-3">
          <Info className="w-5 h-5 text-rose-500 shrink-0" />
          <span>Live official stream notice: Zero synthetic numbers are displayed. Please retry connection to official MoSPI gateway.</span>
        </div>
      ) : activeRecords.length === 0 && dataMode === "LIVE" ? (
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-sm flex items-center gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0" />
          <span>No official records were returned for this specific filter set.</span>
        </div>
      ) : null}

      {/* Stitch Modern Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "charts", label: "Interactive Visualizer", icon: BarChart3 },
            { id: "overview", label: "Dataset Overview", icon: Layers },
            { id: "data", label: "Official Records Table", icon: TableIcon },
            { id: "metadata", label: "Metadata Schema", icon: Code2 },
            { id: "source", label: "API & Gateway", icon: ExternalLink },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as Tab)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-primary-container text-black shadow-md scale-100"
                    : "bg-surface-container-high/40 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
                {item.id === "data" ? (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-md text-[10px] ${
                      isActive ? "bg-black/20 text-black font-mono font-bold" : "bg-surface-container text-on-surface-variant font-mono"
                    }`}
                  >
                    {activeRecords.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-high/40 hover:bg-surface-container-high text-xs font-label-caps text-on-surface transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-high/40 hover:bg-surface-container-high text-xs font-label-caps text-on-surface transition-colors"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE CHARTS STUDIO */}
      {tab === "charts" && (
        <div className="space-y-6">
          {/* Quick-Insight Presets Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container-high/30 border border-outline-variant/20">
            <div className="flex items-center gap-2 text-xs font-label-caps text-on-surface-variant">
              <Sparkles className="w-3.5 h-3.5 text-primary-container" />
              <span>Smart Analysis Presets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {columns.includes("item") && (
                <button
                  type="button"
                  onClick={() => applyPreset("item", "index_value", "bar")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-label-caps border transition-all ${
                    selectedDimension === "item" && chartType === "bar"
                      ? "bg-primary-container/20 border-primary-container text-primary-fixed-dim font-bold"
                      : "bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/50"
                  }`}
                >
                  🏷️ Commodity Comparison
                </button>
              )}
              {columns.includes("majorgroup") && (
                <button
                  type="button"
                  onClick={() => applyPreset("majorgroup", "index_value", "horizontal_bar")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-label-caps border transition-all ${
                    selectedDimension === "majorgroup" && chartType === "horizontal_bar"
                      ? "bg-primary-container/20 border-primary-container text-primary-fixed-dim font-bold"
                      : "bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/50"
                  }`}
                >
                  🏢 Major Groups
                </button>
              )}
              {columns.includes("group") && (
                <button
                  type="button"
                  onClick={() => applyPreset("group", "index_value", "pie")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-label-caps border transition-all ${
                    selectedDimension === "group" && chartType === "pie"
                      ? "bg-primary-container/20 border-primary-container text-primary-fixed-dim font-bold"
                      : "bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/50"
                  }`}
                >
                  🥧 Group Distribution
                </button>
              )}
              {(columns.includes("month") || columns.includes("year")) && (
                <button
                  type="button"
                  onClick={() => applyPreset(columns.includes("month") ? "month" : "year", "index_value", "area")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-label-caps border transition-all ${
                    (selectedDimension === "month" || selectedDimension === "year") && chartType === "area"
                      ? "bg-primary-container/20 border-primary-container text-primary-fixed-dim font-bold"
                      : "bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/50"
                  }`}
                >
                  📈 Period Trend
                </button>
              )}
            </div>
          </div>

          {/* Chart Controls Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Chart Type Selector */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-container-high/60 border border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setChartType("bar")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                    chartType === "bar"
                      ? "bg-primary-container text-black font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Bar Comparison
                </button>

                <button
                  type="button"
                  onClick={() => setChartType("horizontal_bar")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                    chartType === "horizontal_bar"
                      ? "bg-primary-container text-black font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  Ranked Bar
                </button>

                <button
                  type="button"
                  onClick={() => setChartType("area")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                    chartType === "area"
                      ? "bg-primary-container text-black font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Area / Trend
                </button>

                <button
                  type="button"
                  onClick={() => setChartType("line")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                    chartType === "line"
                      ? "bg-primary-container text-black font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Line Curve
                </button>

                <button
                  type="button"
                  onClick={() => setChartType("pie")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-caps transition-all ${
                    chartType === "pie"
                      ? "bg-primary-container text-black font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                  Donut Share
                </button>
              </div>

              {/* Dimension & Metric Pickers */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-label-caps text-on-surface-variant">X-Axis:</label>
                  <select
                    value={selectedDimension}
                    onChange={(e) => setSelectedDimension(e.target.value)}
                    className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-medium"
                  >
                    {dimensionColumns.map((c) => {
                      const card = columnCardinality.get(c) ?? 0;
                      return (
                        <option key={c} value={c}>
                          {c} {card <= 1 ? `(${card} unique value)` : `(${card} categories)`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-label-caps text-on-surface-variant">Y-Metric:</label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-medium"
                  >
                    {numericColumns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-label-caps text-on-surface-variant">Aggregate:</label>
                  <select
                    value={aggType}
                    onChange={(e) => setAggType(e.target.value as AggType)}
                    className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="avg">Average</option>
                    <option value="sum">Sum</option>
                    <option value="max">Maximum</option>
                    <option value="count">Count Rows</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-label-caps text-on-surface-variant">Show:</label>
                  <select
                    value={limitCount}
                    onChange={(e) => setLimitCount(Number(e.target.value))}
                    className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-medium"
                  >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={15}>Top 15</option>
                    <option value={20}>Top 20</option>
                    <option value={0}>All Records</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-label-caps text-on-surface-variant">Sort:</label>
                  <select
                    value={sortOrderChoice}
                    onChange={(e) => setSortOrderChoice(e.target.value as any)}
                    className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="desc">High → Low</option>
                    <option value="asc">Low → High</option>
                    <option value="natural">Original</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stitch KPI Summary Strip */}
          {summaryStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="glass-panel p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50">
                <span className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                  Benchmark Avg ({selectedMetric})
                </span>
                <p className="mt-1.5 text-2xl font-bold font-display text-primary">{summaryStats.avg}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Across {summaryStats.distinctCategories} plotted categories</p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50">
                <span className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                  Peak Index Item
                </span>
                <p className="mt-1.5 text-2xl font-bold font-display text-emerald-500 dark:text-emerald-400">{summaryStats.max}</p>
                <p className="text-[10px] text-on-surface-variant truncate mt-0.5" title={summaryStats.maxLabel}>
                  {summaryStats.maxLabel}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50">
                <span className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                  Lowest Recorded
                </span>
                <p className="mt-1.5 text-2xl font-bold font-display text-amber-500 dark:text-amber-400">{summaryStats.min}</p>
                <p className="text-[10px] text-on-surface-variant truncate mt-0.5" title={summaryStats.minLabel}>
                  {summaryStats.minLabel}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50">
                <span className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                  Dynamic Spread (Δ)
                </span>
                <p className="mt-1.5 text-2xl font-bold font-display text-sky-500 dark:text-sky-400">{summaryStats.spread}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Index variance range</p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 col-span-2 lg:col-span-1">
                <span className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                  Official Records
                </span>
                <p className="mt-1.5 text-2xl font-bold font-display text-on-surface">{summaryStats.totalPoints}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Live verified MoSPI payload</p>
              </div>
            </div>
          ) : null}

          {/* Main Visualizer Container */}
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
              <div>
                <h4 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                  {aggType.toUpperCase()} of {selectedMetric} grouped by {selectedDimension}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Official statistics visualized from MoSPI API with real-time responsive scaling ({chartData.length} categories plotted)
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-label-caps text-on-surface-variant">
                <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 font-mono">
                  Scale: Linear
                </span>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-center p-8">
                <Info className="w-8 h-8 text-on-surface-variant mb-2" />
                <p className="text-sm font-semibold text-on-surface">No chart points available</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Try choosing a different X-Axis column or Y-Metric from the dropdown above.
                </p>
              </div>
            ) : (
              <div className="h-96 w-full pt-4">
                <UniversalChart
                  spec={{
                    type: chartType === "horizontal_bar" ? "bar" : chartType,
                    title: `${aggType.toUpperCase()} of ${selectedMetric}`,
                    xAxis: {
                      field: chartType === "horizontal_bar" ? selectedMetric : selectedDimension,
                      type: chartType === "horizontal_bar" ? "value" : "category",
                    },
                    yAxis: {
                      field: chartType === "horizontal_bar" ? selectedDimension : selectedMetric,
                      type: chartType === "horizontal_bar" ? "category" : "value",
                    },
                    data: chartData,
                    series: [{ field: selectedMetric, name: selectedMetric }],
                  } as unknown as ChartSpec}
                  height={400}
                />
              </div>
            )}
          </div>

          {/* Category Breakdown Summary Table with Progress Meters */}
          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-display text-sm font-bold text-on-surface flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-primary-container" />
                Category Distribution & Metric Ranking
              </h5>
              <span className="text-xs font-label-caps text-on-surface-variant">
                Showing {chartData.length} of {columnCardinality.get(selectedDimension) ?? chartData.length} categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-caps uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Dimension Item ({selectedDimension})</th>
                    <th className="py-2.5 px-3">{aggType.toUpperCase()} ({selectedMetric})</th>
                    <th className="py-2.5 px-3">Row Count</th>
                    <th className="py-2.5 px-3">Relative Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {chartData.map((item, idx) => {
                    const maxVal = Math.max(...chartData.map((d) => (d[selectedMetric] as number) || 0), 1);
                    const itemValue = (item[selectedMetric] as number) || 0;
                    const pct = ((itemValue / maxVal) * 100).toFixed(1);
                    return (
                      <tr key={String(item[selectedDimension]) + idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant/70">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-on-surface max-w-xs truncate" title={String(item[selectedDimension])}>
                          {String(item[selectedDimension])}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{itemValue.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-on-surface-variant font-mono">{item._aggregated_count}</td>
                        <td className="py-2.5 px-3 w-52">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: STITCH_CHART_COLORS[idx % STITCH_CHART_COLORS.length],
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-on-surface-variant">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Official Records</span>
              <p className="mt-2 text-2xl font-bold font-display text-on-surface">
                {displayTotal == null ? "unavailable" : displayTotal.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-on-surface-variant">Available via MoSPI API</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Loaded Records</span>
              <p className="mt-2 text-2xl font-bold font-display text-primary">
                {activeRecords.length.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-on-surface-variant">Active in visualizer</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Frequency</span>
              <p className="mt-2 text-2xl font-bold font-display text-on-surface">{dataset.frequency || "Monthly"}</p>
              <p className="mt-1 text-[11px] text-on-surface-variant">Standard survey cycle</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30">
              <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">Data Stream Mode</span>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-label-caps uppercase tracking-wider ${
                    dataMode === "LIVE"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : dataMode === "CACHED"
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {dataMode}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-on-surface-variant">Proxy isolation: active</p>
            </div>
          </div>

          {/* Dataset Details & Methodology */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 glass-panel p-7 rounded-2xl border border-outline-variant/30 space-y-4">
              <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-container" />
                Dataset Information & Methodology
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {dataset.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20 text-xs">
                <div>
                  <span className="text-on-surface-variant font-label-caps uppercase">Theme:</span>
                  <p className="font-semibold text-on-surface mt-0.5">{dataset.theme}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-label-caps uppercase">Coverage Period:</span>
                  <p className="font-semibold text-on-surface mt-0.5">{dataset.referencePeriod}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-label-caps uppercase">Access Configuration:</span>
                  <p className="font-mono text-primary mt-0.5">{dataset.accessType}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-label-caps uppercase">Last Sync Timestamp:</span>
                  <p className="font-semibold text-on-surface mt-0.5">{dataset.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="glass-panel p-7 rounded-2xl border border-outline-variant/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/10 border border-secondary-container/30 text-secondary-fixed-dim text-xs font-label-caps">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary-fixed-dim" />
                  CREDENTIAL ISOLATION
                </div>
                <h4 className="font-display text-base font-bold text-on-surface">Secure Server-Side Ingestion</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  MoSPI authentication, TLS verification, and token rotation execute exclusively on the StatIQ proxy (port 4000). The client browser never receives sensitive API keys.
                </p>
              </div>

              <div className="pt-4 border-t border-outline-variant/20 space-y-2">
                <button
                  onClick={() => setTab("charts")}
                  className="glow-button w-full py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Launch Charts Studio
                </button>
                <Link
                  href="/ai-analyst"
                  className="glow-button-secondary w-full py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA TABLE */}
      {tab === "data" && (
        <div className="space-y-4">
          {/* Search & Actions Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across all records..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl bg-surface-container-high pl-10 pr-4 py-2 text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-on-surface-variant/60"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-label-caps text-on-surface-variant">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg bg-surface-container-high px-2.5 py-1.5 text-xs text-on-surface border border-outline-variant/40 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <span className="text-xs font-label-caps text-on-surface-variant">
                {filteredRows.length} matching rows
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-panel rounded-2xl border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-surface-container-high/70 border-b border-outline-variant/30 text-on-surface font-label-caps uppercase">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        if (sortColumn === "externalId") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        else {
                          setSortColumn("externalId");
                          setSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        External ID
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    {columns.slice(0, 7).map((col) => (
                      <th
                        key={col}
                        className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          if (sortColumn === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          else {
                            setSortColumn(col);
                            setSortOrder("asc");
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {col}
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 2} className="py-8 text-center text-on-surface-variant">
                        No records matched your search query.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant/60">
                          {(page - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-on-surface font-medium">
                          {row.externalId}
                        </td>
                        {columns.slice(0, 7).map((col) => (
                          <td key={col} className="py-3 px-4">
                            {col === "index_value" || col === "value" ? (
                              <span className="font-mono font-bold text-primary">
                                {String(row.payload?.[col] ?? "")}
                              </span>
                            ) : (
                              String(row.payload?.[col] ?? "—")
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-outline-variant/20 flex items-center justify-between text-xs">
              <span className="font-label-caps text-on-surface-variant">
                Page {page} of {totalPages} ({filteredRows.length} total rows)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-high/40 hover:bg-surface-container-high disabled:opacity-40 disabled:pointer-events-none text-on-surface transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-high/40 hover:bg-surface-container-high disabled:opacity-40 disabled:pointer-events-none text-on-surface transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METADATA SCHEMA */}
      {tab === "metadata" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-base font-bold text-on-surface">Dataset Schema & JSON Definition</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Synchronized catalogue metadata registered in official store
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyMetadata}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-high text-xs font-label-caps text-on-surface hover:text-primary transition-colors"
              >
                {copiedMeta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedMeta ? "Copied!" : "Copy JSON"}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 overflow-x-auto text-xs font-mono text-on-surface leading-relaxed max-h-96">
              {JSON.stringify(dataset, null, 2)}
            </pre>
          </div>

          {/* Field Explorer */}
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-3">
            <h5 className="font-display text-sm font-bold text-on-surface">Detected Payload Fields</h5>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {columns.map((col) => {
                const isNumeric = numericColumns.includes(col);
                return (
                  <div key={col} className="p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-on-surface">{col}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-label-caps uppercase ${
                        isNumeric ? "bg-emerald-500/10 text-emerald-500 font-bold" : "bg-sky-500/10 text-sky-500 font-bold"
                      }`}
                    >
                      {isNumeric ? "numeric" : "string"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: API & SOURCE */}
      {tab === "source" && (
        <div className="glass-panel p-7 rounded-2xl border border-outline-variant/30 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-fixed-dim text-xs font-label-caps mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-container" />
                OFFICIAL ENDPOINT REFERENCE
              </div>
              <h3 className="font-display text-xl font-bold text-on-surface">{dataset.source}</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Authoritative data publisher: Ministry of Statistics & Programme Implementation (MoSPI)
              </p>
            </div>

            {dataset.sourceUrl ? (
              <a
                href={dataset.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-button-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
              >
                Official Portal
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>

          <div className="space-y-3 pt-4 border-t border-outline-variant/20 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-container-high/40">
              <span className="font-label-caps text-on-surface-variant uppercase">Catalogue Identifier:</span>
              <code className="font-mono text-primary font-bold">{dataset.externalId || dataset.id}</code>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-container-high/40">
              <span className="font-label-caps text-on-surface-variant uppercase">StatIQ Backend Proxy Route:</span>
              <code className="font-mono text-on-surface">/api/mospi/wpi?Format=JSON&limit=20&page=1</code>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-container-high/40">
              <span className="font-label-caps text-on-surface-variant uppercase">FastMCP Server URL:</span>
              <code className="font-mono text-on-surface">http://localhost:8000/mcp</code>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-high/20 border border-outline-variant/20 text-xs text-on-surface-variant space-y-2">
            <p className="font-semibold text-on-surface flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-container" />
              Architecture & Security Compliance
            </p>
            <p>
              StatIQ AI strictly adheres to zero-trust proxy design. Sensitive upstream government authentication tokens, TLS renegotiation certificates, and rate-limiting buffers are isolated within the backend runtime. Client-side browser sessions query through sanitized Next.js API endpoints.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
