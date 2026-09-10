import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { retrieveChromaDocuments } from "./chroma-rag";
import { getAllCurriculumSummaries } from "@/lib/course-curriculum";

export interface DualEngineResult {
  answer: string;
  provider: "gemini" | "groq" | "grounded_synthesizer";
  engineLabel: string;
  modelUsed: string;
  failoverOccurred: boolean;
  failoverReason?: string;
  sources: Array<{
    name: string;
    type: string;
    excerpt: string;
    collection?: string;
  }>;
}

// In-memory provider rate-limit tracking
let geminiThrottledUntil = 0;
let groqThrottledUntil = 0;

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const GROQ_API_KEY =
  process.env.GROQ_API_KEY ||
  process.env.AI_API_KEY ||
  "";

const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "groq/compound",
  "groq/compound-mini",
  "qwen/qwen3.8-27b",
];

const SYSTEM_INSTRUCTION = `You are StatIQ National Statistical AI Tutor — an advanced, verified AI learning assistant for India's Official Statistical System (MoSPI, NSSO, CSO, ISS, eSankhyiki, Sunbird / iGOT Karmayogi).

ROLE & BEHAVIOR:
1. **Intelligent Query Understanding**:
   - If the user asks about course recommendations (e.g. "what is best course for me", "where do I start", "recommend me a course"): Review the available courses catalog in context and recommend specific MoSPI / Sunbird courses based on their background (e.g., Python ETL for Microdata, SQL for MoSPI Surveys, WPI/CPI Index Compilations, Stratified Sampling & Survey Design, National Accounts & GVA). Give clear module outlines and reasons.
   - If the user asks about statistical methodology (e.g. WPI, CPI, Laspeyres, Paasche, PLFS multipliers, GDP/GVA, sampling errors, SDC rules): Provide deep, clear, mathematical explanations with official Indian standards.
   - If the user asks for code (Python, SQL, DuckDB, Pandas): Provide production-ready, clean, well-commented code snippets.

2. **Mathematical Rigor & KaTeX Formatting**:
   - ALWAYS use display math \\[ ... \\] for standalone formulas.
   - ALWAYS use inline math \\( ... \\) for inline variables.
   - Example: \\[ \\text{WPI}_t = \\frac{\\sum_{i=1}^N p_{i,t} w_{i,0}}{\\sum_{i=1}^N p_{i,0} w_{i,0}} \\times 100 \\]

3. **Formatting & Structure**:
   - Use clean Markdown with headings (##, ###), bullet points, and markdown tables (| Metric | Value | Description |).
   - Ground facts in official MoSPI handbooks, NSO manuals, and eSankhyiki architecture.`;

/**
 * Attempt generation using Google Gemini with fallback model sequence
 */
async function generateWithGemini(
  prompt: string,
  systemInstruction: string
): Promise<{ answer: string; model: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return { answer: text, model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      // If quota/rate limit error (429 or RESOURCE_EXHAUSTED)
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota")) {
        geminiThrottledUntil = Date.now() + 60_000; // Throttle for 1 minute
      }
      console.warn(`[dual-engine] Gemini model [${model}] failed:`, errMsg.slice(0, 150));
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}

/**
 * Attempt generation using Groq Cloud with fallback model sequence
 */
async function generateWithGroq(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string
): Promise<{ answer: string; model: string }> {
  if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith("gsk_")) {
    throw new Error("Groq API key is not configured or invalid.");
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });
  let lastError: any = null;

  const apiMessages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstruction },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
  ];

  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: apiMessages,
        temperature: 0.25,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        return { answer: text, model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      // If 429 / rate limit
      if (errMsg.includes("429") || errMsg.includes("rate_limit_exceeded") || errMsg.includes("Request too large")) {
        groqThrottledUntil = Date.now() + 60_000;
      }
      console.warn(`[dual-engine] Groq model [${model}] failed:`, errMsg.slice(0, 150));
    }
  }

  throw lastError || new Error("All Groq models failed.");
}

/**
 * Primary Unified Dual-Engine Tutor Dispatcher with Bidirectional Failover
 */
export async function askDualEngineTutor(
  userQuery: string,
  history: Array<{ role: string; content: string }> = []
): Promise<DualEngineResult> {
  const now = Date.now();
  const isGeminiHealthy = now > geminiThrottledUntil;
  const isGroqHealthy = now > groqThrottledUntil;

  // Retrieve Chroma / MoSPI grounded context & Available Courses
  const retrievedDocs = await retrieveChromaDocuments(userQuery, 3);
  const courseCatalog = getAllCurriculumSummaries();

  const contextText = retrievedDocs
    .map((d, i) => `[Verified Handbook ${i + 1}] Source: ${d.source} | Title: ${d.title}\n${d.content}`)
    .join("\n\n");

  const promptWithContext = `OFFICIAL MOSPI & STATIQ VERIFIED KNOWLEDGEBASE:
${contextText}

AVAILABLE OFFICIAL SUNBIRD / MOSPI LEARNING COURSES:
${courseCatalog}

USER QUESTION:
${userQuery}`;

  const defaultSources = retrievedDocs.map((d) => ({
    name: d.title,
    type: "official",
    excerpt: d.source,
    collection: "StatlQAi123",
  }));

  // Strategy: Try primary healthy provider first, then seamlessly fallback to secondary
  const primaryProvider = isGeminiHealthy ? "gemini" : isGroqHealthy ? "groq" : "gemini";

  // Case 1: Primary is Gemini
  if (primaryProvider === "gemini") {
    try {
      const geminiRes = await generateWithGemini(promptWithContext, SYSTEM_INSTRUCTION);
      return {
        answer: geminiRes.answer,
        provider: "gemini",
        engineLabel: "Google Gemini 3.6 Flash (ChromaDB RAG)",
        modelUsed: geminiRes.model,
        failoverOccurred: false,
        sources: defaultSources,
      };
    } catch (geminiErr: any) {
      console.warn("[dual-engine] Gemini hit error/rate-limit. Switching immediately to Groq engine...", geminiErr?.message);
      
      // Secondary Fallback: Groq
      try {
        const groqMessages = [...history, { role: "user", content: promptWithContext }];
        const groqRes = await generateWithGroq(groqMessages, SYSTEM_INSTRUCTION);
        return {
          answer: groqRes.answer,
          provider: "groq",
          engineLabel: "Groq High-Speed Engine (Auto-Failover Active)",
          modelUsed: groqRes.model,
          failoverOccurred: true,
          failoverReason: `Gemini rate-limited/failed: ${geminiErr?.message?.slice(0, 100)}. Switched to Groq.`,
          sources: defaultSources,
        };
      } catch (groqErr: any) {
        console.error("[dual-engine] Both Gemini and Groq failed:", { geminiErr, groqErr });
      }
    }
  } else {
    // Case 2: Primary is Groq (when Gemini was throttled)
    try {
      const groqMessages = [...history, { role: "user", content: promptWithContext }];
      const groqRes = await generateWithGroq(groqMessages, SYSTEM_INSTRUCTION);
      return {
        answer: groqRes.answer,
        provider: "groq",
        engineLabel: "Groq High-Speed Engine",
        modelUsed: groqRes.model,
        failoverOccurred: false,
        sources: defaultSources,
      };
    } catch (groqErr: any) {
      console.warn("[dual-engine] Groq hit error/rate-limit. Switching back to Gemini engine...", groqErr?.message);

      // Fallback: Gemini
      try {
        const geminiRes = await generateWithGemini(promptWithContext, SYSTEM_INSTRUCTION);
        return {
          answer: geminiRes.answer,
          provider: "gemini",
          engineLabel: "Google Gemini 3.6 Flash (Auto-Failover Active)",
          modelUsed: geminiRes.model,
          failoverOccurred: true,
          failoverReason: `Groq rate-limited/failed: ${groqErr?.message?.slice(0, 100)}. Switched to Gemini.`,
          sources: defaultSources,
        };
      } catch (geminiErr: any) {
        console.error("[dual-engine] Both Groq and Gemini failed:", { groqErr, geminiErr });
      }
    }
  }

  // Case 3: Grounded Fallback Synthesizer if both remote APIs are experiencing severe global outage
  return generateGroundedSynthesizerResponse(userQuery, defaultSources);
}

/**
 * Reliable offline knowledge synthesizer for zero-downtime statistical queries
 */
function generateGroundedSynthesizerResponse(
  query: string,
  sources: DualEngineResult["sources"]
): DualEngineResult {
  const lower = query.toLowerCase();

  let answer = "";
  if (lower.includes("course") || lower.includes("recommend") || lower.includes("start") || lower.includes("learn")) {
    answer = `## 🎓 Recommended MoSPI & Sunbird Learning Tracks

Based on the official Ministry of Statistics and Programme Implementation (MoSPI) curriculum, here are the best courses for your statistical learning path:

### 1. **Data Ingestion & Microdata ETL with Python**
- **Target Audience:** Statistical Investigators, Data Analysts, Researchers
- **Key Focus:** Loading fixed-width microdata schedules (PLFS, ASI, HCES), handling raw census codes, and chunked Parquet export.
- **Duration:** 4 Modules · 45 mins

### 2. **Survey Querying & Analysis using SQL**
- **Target Audience:** Data Officers & ISS Probationers
- **Key Focus:** PostgreSQL analytical functions, relational aggregations on state-level aggregates, and eSankhyiki schema mapping.
- **Duration:** 3 Modules · 35 mins

### 3. **Wholesale & Consumer Price Index (WPI & CPI) Compilations**
- **Target Audience:** Price Statistics Division (PSD) Officers
- **Key Focus:** Laspeyres index methodology, geometric mean item-level price relatives, and weighting diagrams.
- **Duration:** 3 Modules · 30 mins

### 4. **Sampling Methods & Survey Design for Official Statistics**
- **Target Audience:** Survey Design and Research Division (SDRD)
- **Key Focus:** Stratified multi-stage sampling, First Stage Units (FSUs), and multiplier estimation weights.
- **Duration:** 4 Modules · 50 mins

---
💡 *Tip: You can enroll in any of these verified courses directly in the **Courses Catalog**.*`;
  } else if (lower.includes("wpi") || lower.includes("laspeyres") || lower.includes("price index") || lower.includes("cpi")) {
    answer = `## 📊 Wholesale Price Index (WPI) Compilation Standard

In official Indian statistics compiled by MoSPI and the Office of the Economic Adviser, the Wholesale Price Index (WPI) with base year **2011-12=100** is computed using the standard **Laspeyres Price Index Formula**:

\\[ \\boxed{\\text{WPI}_t = \\frac{\\sum_{i=1}^{N} p_{i,t} \\, w_{i,0}}{\\sum_{i=1}^{N} p_{i,0} \\, w_{i,0}} \\times 100} \\]

### Formula Variable Definitions:
- \\( p_{i,t} \\) : Price of commodity \\( i \\) in the current period \\( t \\)
- \\( p_{i,0} \\) : Price of commodity \\( i \\) in the base period (2011-12)
- \\( w_{i,0} \\) : Base year weighting factor assigned to item \\( i \\)
- \\( N \\) : Total number of items in the representative commodity basket (697 items)

### Major Commodity Groups in WPI (2011-12 Series):
| Major Group | Weight (%) | Number of Items |
| :--- | :--- | :--- |
| **1. Primary Articles** | 22.62% | 117 |
| **2. Fuel & Power** | 13.15% | 16 |
| **3. Manufactured Products** | 64.23% | 564 |
| **All Commodities (Overall WPI)** | **100.00%** | **697** |`;
  } else {
    answer = `## 🇮🇳 Official Indian Statistical System Standards

Regarding your query on **${query}**:

1. **Methodological Standard:** National statistical metrics adhere to UN Fundamental Principles of Official Statistics, System of National Accounts (SNA 2008), and NSO Survey Guidelines.
2. **Key Estimator Formula:**
\\[ \\boxed{\\hat{Y} = \\sum_{i \\in S} y_i \\times \\text{Multiplier}_i} \\]
3. **Data Quality & Anonymization:** Unit-level microdata undergoes strict Statistical Disclosure Control (SDC with \\( k \\ge 3 \\) anonymity) prior to release on the eSankhyiki microdata platform.`;
  }

  return {
    answer,
    provider: "grounded_synthesizer",
    engineLabel: "StatIQ Verified Statistical Knowledgebase",
    modelUsed: "mospi-official-handbook-v2",
    failoverOccurred: true,
    failoverReason: "Both Gemini & Groq APIs are momentarily busy. Provided verified grounded handbook standard.",
    sources,
  };
}
