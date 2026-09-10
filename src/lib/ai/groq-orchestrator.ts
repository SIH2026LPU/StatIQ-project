import { createCompletion } from "./groq-client";
import type {
  AnalysisPlan,
  AnalysisResult,
  ExecutionTrace,
} from "./contracts";
import { resolveOfficialDataset, extractDatasetMetadata } from "./dataset-registry";
import { executePlanAnalysis } from "./statistical-engine";

const GROQ_PLANNER_SYSTEM_PROMPT = `You are the StatIQ AI Query Planner.
Your task is to analyze the user's statistical query about official Indian government data (MoSPI, NSO, CSO, NSSO, etc.) and generate a structured JSON AnalysisPlan.

DO NOT answer the question directly.
DO NOT invent statistics or numbers.

Select:
1. dataset: The official dataset keyword (e.g. "CPI", "WPI", "PLFS", "IIP", "ASI", "NAS", "ENERGY")
2. intent: "latest_value" | "comparison" | "trend" | "ranking" | "distribution" | "summary" | "change" | "yoy" | "mom" | "cagr"
3. operation: Descriptive string (e.g. "compare_rural_urban_inflation", "monthly_wpi_trend", "state_unemployment_comparison")
4. dimensions: Array of grouping fields (e.g. ["sector"], ["region"], ["category"], ["majorgroup"])
5. metric: The target metric name (e.g. "inflation_rate", "index_value", "unemployment_rate", "lfpr_percentage")
6. chartType: "bar" | "line" | "area" | "table" | "scatter" | "donut"
7. requiresOfficialData: true

Return ONLY valid JSON matching this schema:
{
  "dataset": "CPI",
  "intent": "comparison",
  "operation": "compare_rural_urban_inflation",
  "filters": {},
  "dimensions": ["sector"],
  "metric": "inflation_rate",
  "chartType": "bar",
  "requiresOfficialData": true
}`;

const GROQ_EXPLAINER_SYSTEM_PROMPT = `You are StatIQ AI's Official Statistical Explainer.
You are explaining validated official statistical results retrieved from authoritative Indian government databases (MoSPI, NSO, CSO, NSSO).

GROUNDING RULES:
1. Do NOT introduce any numerical value, percentage, or rate that does not exist in the validated tool results.
2. Do NOT invent missing values or fabricate historical trends.
3. Clearly state the exact observed figures, comparison gaps, and reference period.
4. Explain what the numbers mean economically and practically without speculating on unverified causes.
5. Keep your tone objective, rigorous, and professional.`;

/**
 * Fallback deterministic planner when Groq is not configured or in offline mode
 */
function createDeterministicPlan(question: string): AnalysisPlan {
  const q = question.toLowerCase();

  if (q.includes("rural") && q.includes("urban")) {
    return {
      dataset: "CPI",
      intent: "comparison",
      operation: "compare_rural_urban_cpi_inflation",
      filters: {},
      dimensions: ["sector"],
      metric: "inflation_rate",
      chartType: "bar",
      requiresOfficialData: true,
    };
  }

  if (q.includes("cpi") || q.includes("consumer price") || q.includes("retail inflation")) {
    return {
      dataset: "CPI",
      intent: q.includes("trend") || q.includes("month") || q.includes("time") ? "trend" : "comparison",
      operation: "cpi_general_analysis",
      filters: {},
      dimensions: ["sector"],
      metric: "inflation_rate",
      chartType: q.includes("trend") ? "line" : "bar",
      requiresOfficialData: true,
    };
  }

  if (q.includes("wpi") || q.includes("wholesale")) {
    return {
      dataset: "WPI",
      intent: q.includes("highest") || q.includes("ranking") ? "ranking" : "trend",
      operation: "wholesale_price_index_trend",
      filters: {},
      dimensions: ["majorgroup", "item"],
      metric: "index_value",
      chartType: q.includes("highest") ? "bar" : "line",
      requiresOfficialData: true,
    };
  }

  if (q.includes("plfs") || q.includes("unemployment") || q.includes("labour") || q.includes("employment")) {
    const isState = q.includes("state") || q.includes("punjab") || q.includes("kerala") || q.includes("maharashtra");
    return {
      dataset: "PLFS",
      intent: "comparison",
      operation: isState ? "compare_state_unemployment_rates" : "employment_indicators_summary",
      filters: {},
      dimensions: [isState ? "region" : "gender"],
      metric: "unemployment_rate",
      chartType: "bar",
      requiresOfficialData: true,
    };
  }

  if (q.includes("iip") || q.includes("industrial") || q.includes("manufacturing")) {
    return {
      dataset: "IIP",
      intent: "trend",
      operation: "industrial_production_sectoral_growth",
      filters: {},
      dimensions: ["sector"],
      metric: "index_value",
      chartType: "bar",
      requiresOfficialData: true,
    };
  }

  return {
    dataset: "WPI",
    intent: "trend",
    operation: "general_statistical_trend",
    filters: {},
    dimensions: ["majorgroup"],
    metric: "index_value",
    chartType: "line",
    requiresOfficialData: true,
  };
}

/**
 * Main Two-Pass Hybrid AI Analyst Pipeline
 */
export async function runCompleteAnalysis(
  question: string,
  sessionId?: string
): Promise<AnalysisResult> {
  const reqId = Math.random().toString(36).substring(2, 8);
  const trace: ExecutionTrace[] = [];

  console.log(`[AI][${reqId}] start question="${question}" sessionId="${sessionId || "default"}"`);

  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY || "";
  const modelName = process.env.GROQ_MODEL || process.env.AI_MODEL || "llama-3.3-70b-versatile";

  // -------------------------------------------------------------------------
  // PASS 1: GROQ PLANNING (OR DETERMINISTIC FALLBACK)
  // -------------------------------------------------------------------------
  let plan: AnalysisPlan;
  const t0 = Date.now();

  try {
    const completion = await createCompletion([
      { role: "system", content: GROQ_PLANNER_SYSTEM_PROMPT },
      { role: "user", content: question },
    ], { response_format: { type: "json_object" }, temperature: 0.1 });
    
    const rawJson = completion.content || "{}";
    const parsed = JSON.parse(rawJson);
    plan = {
      dataset: parsed.dataset || "CPI",
      intent: parsed.intent || "latest_value",
      operation: parsed.operation || "statistical_analysis",
      filters: parsed.filters || {},
      dimensions: parsed.dimensions || ["sector"],
      metric: parsed.metric || "inflation_rate",
      chartType: parsed.chartType || "bar",
      requiresOfficialData: true,
    };

    trace.push({
      stage: "1. Groq Strategic Planning",
      details: `Model: ${completion.modelUsed} | Intent: ${plan.intent} | Target: ${plan.dataset} | Metric: ${plan.metric}`,
      durationMs: Date.now() - t0,
    });
    console.log(`[AI][${reqId}] plan model=${completion.modelUsed} dataset=${plan.dataset} intent=${plan.intent}`);
  } catch (e: any) {
    plan = createDeterministicPlan(question);
    trace.push({
      stage: "1. Deterministic Planning (Fallback)",
      details: `Routed to ${plan.dataset} via pattern matching (${e.message})`,
      durationMs: Date.now() - t0,
    });
  }

  // -------------------------------------------------------------------------
  // STATIQ OFFICIAL DATA RETRIEVAL & METADATA EXPLORATION
  // -------------------------------------------------------------------------
  const t1 = Date.now();
  const resolution = resolveOfficialDataset(plan.dataset);

  if (!resolution || resolution.records.length === 0) {
    console.log(`[AI][${reqId}] data records=0 (EMPTY)`);
    return {
      success: false,
      answer: "No official observations were found matching the requested query filters in the MoSPI database.",
      title: "No Official Records Found",
      dataset: {
        id: plan.dataset,
        name: plan.dataset,
        source: "MoSPI / NSO Official Platform",
      },
      keyFindings: [],
      methodology: {
        operation: plan.operation,
        dataset: plan.dataset,
        metric: plan.metric || "N/A",
        recordsUsed: 0,
      },
      evidence: {
        source: "MoSPI",
        dataset: plan.dataset,
        datasetId: plan.dataset,
        retrievedAt: new Date().toISOString(),
        recordsUsed: 0,
        mode: "STORED",
      },
      limitations: ["No matching official records found."],
      executionTrace: trace,
    };
  }

  const { dataset, records } = resolution;
  const metadata = extractDatasetMetadata(dataset, records);
  console.log(`[AI][${reqId}] data records=${records.length} dataset=${dataset.id}`);

  trace.push({
    stage: "2. Official Data Retrieval",
    details: `Fetched ${records.length} verified records from '${dataset.source}' (${dataset.name})`,
    durationMs: Date.now() - t1,
  });

  // -------------------------------------------------------------------------
  // STATIQ DETERMINISTIC STATISTICAL COMPUTATION ENGINE
  // -------------------------------------------------------------------------
  const t2 = Date.now();
  const mode = dataset.accessType.includes("live") ? "LIVE" : "STORED";
  const analysisOutput = executePlanAnalysis(plan, dataset, records, mode);
  trace.push({
    stage: "3. Deterministic Statistical Calculation",
    details: `Computed ${analysisOutput.keyFindings.length} key findings, summary metrics, and visualization spec`,
    durationMs: Date.now() - t2,
  });
  console.log(`[AI][${reqId}] calculation findings=${analysisOutput.keyFindings.length}`);

  // -------------------------------------------------------------------------
  // PASS 2: GROQ EXPLANATION SYNTHESIS (OR DETERMINISTIC EXPLANATION)
  // -------------------------------------------------------------------------
  const t3 = Date.now();
  let finalAnswer = "";

  try {
    const completion = await createCompletion([
      { role: "system", content: GROQ_EXPLAINER_SYSTEM_PROMPT },
      {
        role: "user",
        content: `User Question: "${question}"
Dataset: ${dataset.name} (${dataset.source})
Reference Period: ${dataset.referencePeriod}
Calculated Key Findings:
${analysisOutput.keyFindings.map((f) => `- ${f.label}: ${f.value}${f.unit ? " " + f.unit : ""} (${f.change || ""})`).join("\n")}
Methodology Formula: ${analysisOutput.methodology.formula || "Direct official observation aggregation"}
Records Used: ${analysisOutput.recordsUsedCount}

Explain these validated results clearly and concisely.`,
      },
    ], { temperature: 0.2 });

    finalAnswer = completion.content || "";
    trace.push({
      stage: "4. Groq Analytical Synthesis",
      details: `Model: ${completion.modelUsed} | Synthesized grounded explanation based strictly on computed official metrics`,
      durationMs: Date.now() - t3,
    });
    console.log(`[AI][${reqId}] groq-final success`);
  } catch (e: any) {
    finalAnswer = buildDeterministicExplanation(question, dataset, analysisOutput);
    trace.push({
      stage: "4. Grounded Synthesis (Deterministic)",
      details: `Generated explanation from validated arithmetic findings (${e.message})`,
      durationMs: Date.now() - t3,
    });
    console.log(`[AI][${reqId}] groq-final (deterministic) fallback applied`);
  }

  console.log(`[AI][${reqId}] success`);

  return {
    success: true,
    answer: finalAnswer,
    title: analysisOutput.title,
    dataset: {
      id: dataset.id,
      name: dataset.name,
      source: dataset.source,
    },
    period: {
      label: dataset.referencePeriod || "Latest available",
    },
    filters: plan.filters,
    keyFindings: analysisOutput.keyFindings,
    table: analysisOutput.table,
    chart: analysisOutput.chart,
    methodology: analysisOutput.methodology,
    evidence: analysisOutput.evidence,
    limitations: analysisOutput.limitations,
    executionTrace: trace,
  };
}

/**
 * Builds a clean, deterministic natural-language explanation when Groq API key is not configured
 */
function buildDeterministicExplanation(
  question: string,
  dataset: { name: string; source: string; referencePeriod: string },
  analysisOutput: ReturnType<typeof executePlanAnalysis>
): string {
  const findings = analysisOutput.keyFindings;
  if (findings.length === 0) {
    return `Official records from ${dataset.source} (${dataset.name}) were inspected, but no valid numeric observations matched the query.`;
  }

  if (findings.length >= 2 && (question.toLowerCase().includes("rural") || question.toLowerCase().includes("compare"))) {
    const f1 = findings[0];
    const f2 = findings[1];
    const diff = findings.find((f) => f.label.includes("Gap") || f.label.includes("Premium"));
    const diffText = diff ? ` This represents a disparity of ${diff.value} ${diff.unit || "points"}.` : "";

    return `According to official ${dataset.name} observations published by ${dataset.source} (${dataset.referencePeriod}), the ${f1.label} stands at ${f1.value}${f1.unit || ""}, while the ${f2.label} is recorded at ${f2.value}${f2.unit || ""}.${diffText} All values are grounded in verified government records without estimation.`;
  }

  const latest = findings.find((f) => f.label.includes("Latest") || f.label.includes("Mean"));
  const peak = findings.find((f) => f.label.includes("High") || f.label.includes("Max"));
  const trough = findings.find((f) => f.label.includes("Low") || f.label.includes("Min"));

  let summary = `Based on official ${dataset.name} records from ${dataset.source} for ${dataset.referencePeriod}`;
  if (latest) summary += `, the ${latest.label.toLowerCase()} is ${latest.value}${latest.unit || ""}${latest.change ? ` (${latest.change})` : ""}`;
  if (peak) summary += `, with a historical peak of ${peak.value}${peak.unit || ""}`;
  if (trough) summary += ` and a minimum of ${trough.value}${trough.unit || ""}`;
  summary += ". All calculations are executed deterministically via the StatIQ statistical engine.";

  return summary;
}
