"use client";

import { useState, useCallback } from "react";
import { UniversalChart } from "@/components/charts/universal-chart";
import { ChartSpec } from "@/lib/visualization/chart-schema";
export interface DataRecord {
  [key: string]: string | number | null;
}

export interface MoSPIQueryResult {
  success: boolean;
  source: {
    provider: "Ministry of Statistics and Programme Implementation";
    dataset: string;
    datasetName: string;
    sourceType: "official-government-api";
    officialUrl: "https://api.mospi.gov.in";
  };
  query: {
    userQuery: string;
    dataset: string;
    indicatorCode: number;
    indicatorName: string;
    filters: Record<string, unknown>;
    resolvedFilters: Record<string, string>;
  };
  data: DataRecord[];
  metadata: {
    unit?: string;
    frequency?: string;
    availableYears?: string[];
    vizTypes?: string[];
  };
  fetchedAt: string;
  error?: string;
}
const EXAMPLE_QUERIES = [
  "Show unemployment rate in Punjab",
  "Show India's unemployment rate from 2018 to 2024",
  "Compare unemployment between Punjab and Haryana",
  "Show CPI inflation in India for available years",
  "Show CPI trend for rural and urban areas",
  "Show India's industrial production trend",
  "Show GDP growth for India",
  "Show PLFS unemployment data 2019 to 2024",
  "Show female unemployment rate in India",
];

type ChartDatum = { label: string; value: number };

function extractChartData(result: MoSPIQueryResult): ChartDatum[] {
  const rows = result.data.slice(0, 30);
  return rows
    .map((row) => {
      // Find year-like key
      const yearKey = Object.keys(row).find((k) =>
        k.toLowerCase().includes("year") || k.toLowerCase() === "yr"
      );
      const valueKey = Object.keys(row).find(
        (k) =>
          typeof row[k] === "number" &&
          !k.toLowerCase().includes("code") &&
          !k.toLowerCase().includes("id")
      );
      const label = yearKey ? String(row[yearKey]) : String(Object.values(row)[0]);
      const value = valueKey ? Number(row[valueKey]) : 0;
      return { label, value };
    })
    .filter((d) => d.label && !isNaN(d.value));
}

function ProvenanceBar({ result }: { result: MoSPIQueryResult }) {
  return (
    <div className="mt-6 rounded-xl border border-outline-variant/50 bg-surface-container-low p-4 text-xs text-on-surface-variant">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <span>
          <span className="font-label-caps uppercase tracking-wider">Provider:</span>{" "}
          {result.source.provider}
        </span>
        <span>
          <span className="font-label-caps uppercase tracking-wider">Dataset:</span>{" "}
          {result.source.dataset} — {result.source.datasetName}
        </span>
        <span>
          <span className="font-label-caps uppercase tracking-wider">Source:</span>{" "}
          <a
            href={result.source.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-container transition-colors"
          >
            Official MoSPI API ↗
          </a>
        </span>
        <span>
          <span className="font-label-caps uppercase tracking-wider">Fetched:</span>{" "}
          {new Date(result.fetchedAt).toLocaleString("en-IN")}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(result.query.resolvedFilters).map(([k, v]) => (
          <span
            key={k}
            className="rounded-full border border-primary-container/20 bg-primary-container/10 px-2 py-0.5 text-primary-container font-label-caps"
          >
            {k}: {v}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MoSPIExplorer() {
  const [query, setQuery] = useState("Show unemployment rate in Punjab");
  const [result, setResult] = useState<MoSPIQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<{ connected: boolean } | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar">("bar");

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/mospi/health");
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({ connected: false });
    }
  }, []);

  const runQuery = useCallback(async (q: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/mospi/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data: MoSPIQueryResult = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        source: {
          provider: "Ministry of Statistics and Programme Implementation",
          dataset: "UNKNOWN",
          datasetName: "Unknown",
          sourceType: "official-government-api",
          officialUrl: "https://api.mospi.gov.in",
        },
        query: { userQuery: q, dataset: "", indicatorCode: 0, indicatorName: "", filters: {}, resolvedFilters: {} },
        data: [],
        metadata: {},
        fetchedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const chartData = result?.success ? extractChartData(result) : [];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            OFFICIAL GOVERNMENT DATA
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-on-surface">MoSPI Data Explorer</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Live data from the Ministry of Statistics &amp; Programme Implementation (India)
          </p>
        </div>
        <button
          onClick={checkHealth}
          className="flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          {health === null
            ? "Check Connection"
            : health.connected
              ? <><span className="w-2 h-2 rounded-full bg-green-500" /> MoSPI Connected</>
              : <><span className="w-2 h-2 rounded-full bg-red-500" /> MCP Offline</>}
        </button>
      </div>

      {/* Example queries */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.slice(0, 5).map((eq) => (
          <button
            key={eq}
            onClick={() => { setQuery(eq); runQuery(eq); }}
            className="rounded-full border border-outline-variant px-3 py-1 text-xs text-on-surface-variant hover:border-primary-container hover:text-primary-container transition-colors"
          >
            {eq}
          </button>
        ))}
      </div>

      {/* Query input */}
      <div className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runQuery(query)}
          placeholder="Ask about any MoSPI dataset — e.g. Show unemployment rate in Punjab"
          className="flex-1 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all"
        />
        <button
          onClick={() => runQuery(query)}
          disabled={loading || !query.trim()}
          className="glow-button rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Fetching…
            </span>
          ) : (
            "Query MoSPI"
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <div className="mx-auto w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-on-surface-variant">
            Running 4-step MCP workflow: list_datasets → get_indicators → get_metadata → get_data…
          </p>
        </div>
      )}

      {/* Error state */}
      {result && !result.success && (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-6">
          <p className="font-semibold text-error">Data Unavailable</p>
          <p className="mt-2 text-sm text-on-surface-variant">{result.error}</p>
          {result.metadata.availableYears && result.metadata.availableYears.length > 0 && (
            <p className="mt-2 text-xs text-on-surface-variant">
              Available years: {result.metadata.availableYears.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {result?.success && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  {result.source.dataset} — {result.source.datasetName}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-on-surface">
                  {result.query.indicatorName}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold text-primary-container">
                  {result.data.length}
                </p>
                <p className="text-xs text-on-surface-variant">records returned</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="glass-panel rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-on-surface">Chart</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType("line")}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${chartType === "line" ? "border-primary-container bg-primary-container/10 text-primary-container" : "border-outline-variant text-on-surface-variant"}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType("bar")}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${chartType === "bar" ? "border-primary-container bg-primary-container/10 text-primary-container" : "border-outline-variant text-on-surface-variant"}`}
                  >
                    Bar
                  </button>
                </div>
              </div>
              <UniversalChart 
                spec={{
                  type: chartType,
                  title: result.query.indicatorName,
                  xAxis: { field: "label", type: "category" },
                  yAxis: { field: "value", type: "value" },
                  data: chartData,
                  series: [{ field: "value", name: result.query.indicatorName }]
                } as unknown as ChartSpec} 
                height={350} 
              />
            </div>
          )}

          {/* Data table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30">
              <p className="font-semibold text-on-surface">Raw Data</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Showing {Math.min(result.data.length, 20)} of {result.data.length} records. All values from Official MoSPI API.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-container-high">
                    {result.data[0] &&
                      Object.keys(result.data[0]).map((col) => (
                        <th key={col} className="px-4 py-3 text-left font-label-caps text-on-surface-variant uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-t border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-4 py-3 text-on-surface">
                          {val === null ? "—" : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provenance */}
          <ProvenanceBar result={result} />
        </div>
      )}
    </div>
  );
}
