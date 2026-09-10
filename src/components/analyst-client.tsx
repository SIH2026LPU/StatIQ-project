"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Sparkles,
  Send,
  Database,
  ShieldCheck,
  Bot,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Info,
  RefreshCw,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  FileSpreadsheet,
  ExternalLink,
  BookOpen,
  Activity,
  AlertTriangle,
  FileCode,
  Globe,
} from "lucide-react";
import { UniversalChart } from "@/components/charts/universal-chart";
import { ChartToolbar } from "@/components/charts/chart-toolbar";
import {
  AnalysisResult,
  KeyFinding,
  AnalysisTable,
} from "@/lib/ai/contracts";

type PipelineStage =
  | "idle"
  | "planning"
  | "fetching"
  | "calculating"
  | "validating"
  | "explaining"
  | "success"
  | "partial"
  | "error";

const SUGGESTED_QUERIES = [
  { text: "What are the latest consumer price index (CPI) inflation rates across rural and urban groups?", tag: "CPI Inflation" },
  { text: "Show the trend of Wholesale Price Index (WPI) over the available period.", tag: "WPI Trend" },
  { text: "Which WPI commodities have the highest index values?", tag: "WPI Commodities" },
  { text: "Compare PLFS unemployment rates across Punjab and Kerala.", tag: "PLFS Unemployment" },
  { text: "Show IIP growth over the last five years.", tag: "IIP Industry" },
  { text: "Compare CPI and WPI inflation trends.", tag: "CPI vs WPI" },
];

import { useLanguage } from "@/components/language/language-provider";

export function AnalystClient() {
  const { currentLanguage } = useLanguage();
  const [question, setQuestion] = useState("What are the latest consumer price index (CPI) inflation rates across rural and urban groups?");
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [stageMessage, setStageMessage] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [history, setHistory] = useState<Array<{ question: string; result: AnalysisResult }>>([]);

  async function ask(queryText?: string) {
    const q = (queryText ?? question).trim();
    if (!q) return;

    setError(null);
    setResult(null);

    try {
      // Progressive Pipeline Simulation during network call
      setStage("planning");
      setStageMessage("UNDERSTANDING QUESTION & CREATING ANALYSIS PLAN");

      const t1 = setTimeout(() => {
        setStage("fetching");
        setStageMessage("FETCHING OFFICIAL DATA FROM MOSPI PLATFORM");
      }, 300);

      const t2 = setTimeout(() => {
        setStage("calculating");
        setStageMessage("EXECUTING DETERMINISTIC STATISTICAL CALCULATIONS");
      }, 700);

      const t3 = setTimeout(() => {
        setStage("validating");
        setStageMessage("VALIDATING DATA INTEGRITY & CHART SPECIFICATION");
      }, 1100);

      const t4 = setTimeout(() => {
        setStage("explaining");
        setStageMessage("GENERATING GROUNDED AI EXPLANATION");
      }, 1500);

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: q, 
          sessionId: "session-active",
          uiLanguage: currentLanguage.code 
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      const json = await response.json();

      if (!response.ok || json.success === false) {
        setStage("error");
        setError(json.error?.message || json.result?.answer || "Official analysis request failed.");
        return;
      }

      // Read canonical result property
      const res: AnalysisResult = json.data?.result ?? json.result ?? json.data ?? json;

      if (!res || !res.dataset) {
        setStage("error");
        setError("Invalid response format received from statistical engine.");
        return;
      }

      setResult(res);
      setStage("success");
      setHistory((prev) => [{ question: q, result: res }, ...prev.slice(0, 4)]);
    } catch (err: any) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Network error. Please ensure backend gateway is running.");
    }
  }

  const handleCopyReport = () => {
    if (!result) return;
    const text = `STATIQ AI STATISTICAL INTELLIGENCE REPORT
Title: ${result.title}
Dataset: ${result.dataset.name} (${result.dataset.source})
Mode: ${result.evidence.mode} | Retrieved: ${result.evidence.retrievedAt}

ANSWER:
${result.answer}

KEY FINDINGS:
${result.keyFindings.map((f) => `- ${f.label}: ${f.value}${f.unit ? " " + f.unit : ""}${f.change ? ` (${f.change})` : ""}`).join("\n")}

METHODOLOGY:
- Operation: ${result.methodology.operation}
- Metric: ${result.methodology.metric}
- Records Used: ${result.methodology.recordsUsed}
${result.methodology.formula ? `- Formula: ${result.methodology.formula}` : ""}

SOURCE & EVIDENCE:
- Source: ${result.evidence.source}
- Source URL: ${result.evidence.sourceUrl || "https://api.mospi.gov.in"}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBusy = stage !== "idle" && stage !== "success" && stage !== "error";

  return (
    <div className="space-y-8">
      {/* Statistical Query Console Header & Input */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-outline-variant/30 space-y-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-on-surface">
                  Statistical Query Console
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-label-caps uppercase font-bold">
                  Groq + StatIQ Engine
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Official Indian Government Statistical Intelligence Grounded in MoSPI & NSO Databases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-label-caps font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Validated Statistical Analysis
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <div className="relative">
            <textarea
              className="w-full rounded-2xl bg-surface-container-high/60 border border-outline-variant/40 p-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all leading-relaxed resize-y min-h-[100px] font-sans"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask any question regarding CPI, WPI, PLFS, IIP, ASI, or National Accounts (e.g. 'What are the latest CPI inflation rates across rural and urban groups?')..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  ask();
                }
              }}
            />
          </div>

          {/* Suggested Query Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-label-caps uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3 h-3 text-primary" />
              Suggested Official Queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((sq) => (
                <button
                  key={sq.tag}
                  type="button"
                  onClick={() => {
                    setQuestion(sq.text);
                    ask(sq.text);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface transition-all text-left group"
                >
                  <span className="font-label-caps text-primary font-bold text-[10px] uppercase">
                    {sq.tag}:
                  </span>
                  <span className="truncate max-w-xs">{sq.text}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>Target: Groq LLaMA 3.3 70B • Official MoSPI Gateway • 100% Deterministic Arithmetic</span>
            </div>

            <button
              type="submit"
              disabled={isBusy || !question.trim()}
              className="glow-button inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-label-caps text-xs font-bold uppercase tracking-wider text-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isBusy ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Official Records…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  ANALYZE OFFICIAL DATA
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Stage Loading Progress Bar */}
      {isBusy && (
        <div className="glass-panel p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-label-caps font-bold text-primary uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {stageMessage}
            </span>
            <span className="font-mono">{stage.toUpperCase()}</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{
                width:
                  stage === "planning"
                    ? "25%"
                    : stage === "fetching"
                    ? "50%"
                    : stage === "calculating"
                    ? "75%"
                    : stage === "validating" || stage === "explaining"
                    ? "90%"
                    : "10%",
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {stage === "error" && error && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            Official Data Analysis Notice
          </div>
          <p className="text-on-surface-variant leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => ask()}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface hover:border-primary text-xs font-semibold"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Empty State Before Any Query */}
      {stage === "idle" && !result && (
        <div className="glass-panel p-12 rounded-3xl border border-outline-variant/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Database className="w-6 h-6 opacity-70" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-on-surface text-base">ASK A QUESTION</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Ask about CPI, WPI, PLFS, IIP, ASI, and other official Indian economic datasets. StatIQ retrieves verified government records and performs deterministic statistical analysis.
            </p>
          </div>
        </div>
      )}

      {/* Statistical Result Renderer */}
      {result && stage === "success" && (
        <StatisticalResultRenderer
          result={result}
          copied={copied}
          onCopy={handleCopyReport}
          showTable={showTable}
          onToggleTable={() => setShowTable(!showTable)}
        />
      )}
    </div>
  );
}

/**
 * Generic Statistical Result Renderer Component
 * Renders any validated AnalysisResult contract without dataset-specific hardcoding.
 */
function StatisticalResultRenderer({
  result,
  copied,
  onCopy,
  showTable,
  onToggleTable,
}: {
  result: AnalysisResult;
  copied: boolean;
  onCopy: () => void;
  showTable: boolean;
  onToggleTable: () => void;
}) {
  const [overrideChartType, setOverrideChartType] = useState<string | null>(null);

  useEffect(() => {
    setOverrideChartType(null);
  }, [result]);

  const currentChartType = overrideChartType || (result.chart?.type ?? "bar");

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-primary/30 space-y-6 shadow-sm">
        {/* Report Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[11px] font-bold border border-primary/20">
                {result.dataset.id.toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-label-caps uppercase font-bold ${
                  result.evidence.mode === "LIVE"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {result.evidence.mode} OFFICIAL DATA
              </span>
              {result.period?.label && (
                <span className="text-xs text-on-surface-variant font-medium">
                  • Period: {result.period.label}
                </span>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface">
              {result.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-high text-xs font-label-caps text-on-surface hover:text-primary transition-colors font-semibold shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Report"}
          </button>
        </div>

        {/* Answer Panel: Statistical Insight */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-label-caps uppercase tracking-wider font-bold text-primary">
            <BookOpen className="w-4 h-4" />
            STATISTICAL INSIGHT
          </div>
          <div className="p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 text-sm text-on-surface leading-relaxed whitespace-pre-wrap font-sans">
            {result.answer}
          </div>
        </div>

        {/* Key Findings Adaptive Cards */}
        {result.keyFindings && result.keyFindings.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-label-caps uppercase tracking-wider text-on-surface-variant font-bold">
              KEY FINDINGS
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 space-y-1"
                >
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">
                    {finding.label}
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-2xl font-bold text-on-surface">
                      {finding.value}
                      {finding.unit && (
                        <span className="text-xs font-sans font-medium text-on-surface-variant ml-1">
                          {finding.unit}
                        </span>
                      )}
                    </span>
                    {finding.change && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                          finding.status === "up"
                            ? "text-emerald-500"
                            : finding.status === "down"
                            ? "text-rose-500"
                            : "text-primary"
                        }`}
                      >
                        {finding.status === "up" && <TrendingUp className="w-3 h-3" />}
                        {finding.status === "down" && <TrendingDown className="w-3 h-3" />}
                        {finding.change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualization Section */}
        {result.chart && result.chart.data && result.chart.data.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="text-xs font-label-caps uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
                VISUALIZATION: {result.chart.title}
              </div>
              {result.chart.unit && (
                <span className="text-[10px] font-mono bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
                  Unit: {result.chart.unit}
                </span>
              )}
            </div>

            <div className="rounded-2xl bg-surface-container-low/40 border border-outline-variant/20 overflow-hidden">
              <ChartToolbar 
                spec={{ ...result.chart, type: currentChartType } as any}
                onTypeChange={(type) => setOverrideChartType(type)}
              />
              <div className="p-4 pt-2">
                <UniversalChart 
                  spec={{ ...result.chart, type: currentChartType } as any} 
                  height={400} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Data Table Section */}
        {result.table && result.table.rows && result.table.rows.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="text-xs font-label-caps uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                DATA TABLE ({result.table.rows.length} records)
              </div>
              <button
                type="button"
                onClick={onToggleTable}
                className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1"
              >
                {showTable ? "Hide Table" : "Show Table"}
                {showTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showTable && (
              <div className="rounded-2xl border border-outline-variant/30 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-surface-container-high/80 border-b border-outline-variant/30 text-on-surface font-label-caps uppercase text-[10px]">
                    <tr>
                      {result.table.columns.map((col) => (
                        <th key={col} className="py-2.5 px-4 font-semibold">
                          {col.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant font-mono text-[11px]">
                    {result.table.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-high/30">
                        {result.table!.columns.map((col) => (
                          <td key={col} className="py-2.5 px-4">
                            {row[col] != null ? String(row[col]) : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Methodology Section */}
        {result.methodology && (
          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <div className="text-xs font-label-caps uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              METHODOLOGY
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Method / Operation</dt>
                <dd className="font-semibold text-on-surface mt-0.5">{result.methodology.operation.replace(/_/g, " ")}</dd>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Target Metric</dt>
                <dd className="font-semibold text-on-surface mt-0.5">{result.methodology.metric.replace(/_/g, " ")}</dd>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Records Used</dt>
                <dd className="font-mono text-primary font-bold mt-0.5">{result.methodology.recordsUsed} rows</dd>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Calculation</dt>
                <dd className="font-semibold text-on-surface mt-0.5">{result.methodology.aggregation || "Deterministic arithmetic"}</dd>
              </div>
            </dl>

            {result.methodology.formula && (
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-xs font-mono text-on-surface">
                <span className="text-on-surface-variant block text-[10px] font-label-caps uppercase mb-1">Formula:</span>
                <code>{result.methodology.formula}</code>
              </div>
            )}
          </div>
        )}

        {/* Source & Evidence Section */}
        {result.evidence && (
          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="text-xs font-label-caps uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                SOURCE & EVIDENCE
              </div>
              {result.evidence.sourceUrl && (
                <a
                  href={result.evidence.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  [Open Official Source]
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Source Authority</dt>
                <dd className="font-semibold text-on-surface mt-0.5">{result.evidence.source}</dd>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Dataset Name</dt>
                <dd className="font-semibold text-on-surface mt-0.5 truncate">{result.evidence.dataset}</dd>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Ingestion Mode</dt>
                <dd className="font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{result.evidence.mode}</dd>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/30 border border-outline-variant/20">
                <dt className="font-label-caps text-on-surface-variant uppercase text-[10px]">Retrieved Timestamp</dt>
                <dd className="font-mono text-on-surface mt-0.5">{new Date(result.evidence.retrievedAt).toLocaleTimeString()}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Limitations Section */}
        {result.limitations && result.limitations.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-outline-variant/20">
            <div className="text-xs font-label-caps uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              LIMITATIONS & METHODOLOGICAL SCOPE
            </div>
            <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
              {result.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
