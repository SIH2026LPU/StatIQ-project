"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  HelpCircle,
  ShieldCheck,
  Brain,
  CheckCircle2,
  RefreshCw,
  Layers,
} from "lucide-react";
import { useTranslation } from "@/components/language/language-provider";

const SUGGESTED_QUERIES = [
  "Which department has the largest SQL and microdata competency gap?",
  "Summarize overall workforce readiness for Sample Survey Division.",
  "What is the average completion rate for official iGOT courses?",
  "Recommend priority training interventions for officers in Field Operations.",
];

export function AnalyticsAssistant() {
  const { t, currentLanguage, translateDynamic } = useTranslation();
  const [q, setQ] = useState("Which department has the largest SQL gap?");
  const [a, setA] = useState("");
  const [pending, setPending] = useState(false);

  async function ask(queryToAsk?: string) {
    const question = queryToAsk || q;
    if (!question.trim()) return;
    setPending(true);
    try {
      const response = await fetch("/api/ai/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      let answerText = data.answer ?? data.error ?? "No response received.";

      if (currentLanguage.code !== "en" && answerText) {
        answerText = await translateDynamic(answerText, currentLanguage.code);
      }

      setA(answerText);
    } catch (e: any) {
      setA(e.message || "Failed to analyze query.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="glass-panel p-6 rounded-3xl border border-outline-variant/30 space-y-4"
      >
        <div className="space-y-2">
          <label className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider block">
            {t("analyst.placeholder", "Natural Language Executive Query")}
          </label>
          <div className="relative">
            <input
              className="w-full rounded-2xl bg-surface-container-high/60 border border-outline-variant/40 p-4 pr-32 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors shadow-inner"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask any aggregate workforce competency question..."
              required
            />
            <button
              type="submit"
              disabled={pending}
              className="glow-button absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {pending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {t("common.loading", "Analyzing")}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("common.search", "Analyze")}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider block">
            Suggested Executive Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setQ(prompt);
                  ask(prompt);
                }}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary-container/15 hover:text-primary transition-colors border border-outline-variant/30 text-on-surface-variant"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Answer Output Panel */}
      {a && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-primary-container/30 space-y-4 animate-fade-up">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-on-surface">
                {t("analyst.keyInsights", "Executive Intelligence Synthesis")}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-label-caps text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Privacy-Preserved Aggregation
            </span>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
            {a}
          </div>

          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant font-label-caps">
            <span>Aggregated across DoPT Competency Benchmark DB</span>
            <span>Zero Individual Records Exposed</span>
          </div>
        </div>
      )}
    </div>
  );
}
