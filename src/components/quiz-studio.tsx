"use client";

import { useState } from "react";
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/components/language/language-provider";

type Draft = { id: string; prompt: string; status: string; difficulty: string };

export function QuizStudio({
  competencies,
  initialDrafts,
}: {
  competencies: Array<{ id: string; name: string }>;
  initialDrafts: Draft[];
}) {
  const { t, tEntity } = useTranslation();
  const [topic, setTopic] = useState("SQL for survey microdata");
  const [competencyId, setCompetencyId] = useState("c-sql");
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState("medium");
  const [items, setItems] = useState<
    Array<Draft & { validation?: { ok: boolean; issues: string[] } }>
  >(initialDrafts);
  const [pending, setPending] = useState(false);

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, competencyId, count, difficulty }),
      });
      const data = await response.json();
      if (data.questions) {
        setItems((prev) => [...(data.questions ?? []), ...prev]);
      }
    } catch {
      // Handled
    } finally {
      setPending(false);
    }
  }

  async function publish(id: string) {
    await fetch("/api/questions/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "published" }),
    });
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "published" } : item))
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      {/* Quiz Generation Form */}
      <form
        onSubmit={generate}
        className="glass-panel p-6 rounded-3xl border border-outline-variant/30 space-y-5 h-fit"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-on-surface">
            {t("quiz.generatorTitle", "AI Item Generator")}
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider block">
            {t("quiz.topicPrompt", "Statistical Topic / Prompt")}
          </label>
          <input
            className="w-full rounded-xl bg-surface-container-high/60 border border-outline-variant/40 p-3 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("quiz.topicPlaceholder", "e.g. Sampling variance in NSS surveys")}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider block">
            {t("quiz.targetCompetency", "Target Competency")}
          </label>
          <select
            className="w-full rounded-xl bg-surface-container-high/60 border border-outline-variant/40 p-3 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            value={competencyId}
            onChange={(e) => setCompetencyId(e.target.value)}
          >
            {competencies.map((c) => (
              <option key={c.id} value={c.id}>
                {tEntity(c.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider block">
            {t("assessments.difficulty", "Difficulty Level")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`py-2 rounded-xl text-xs font-label-caps uppercase font-bold transition-all ${
                  difficulty === d
                    ? "bg-primary-container text-black shadow-md"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                }`}
              >
                {tEntity(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-label-caps text-on-surface-variant">
            <span>{t("assessments.questionCount", "Question Count")}</span>
            <span className="font-mono text-primary font-bold">{count} {t("quiz.items", "items")}</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="glow-button w-full py-3 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {pending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {t("quiz.generatingItems", "Generating Items…")}
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              {t("quiz.generateForReview", "Generate for Review")}
            </>
          )}
        </button>

        <p className="text-[11px] text-on-surface-variant/70 text-center leading-relaxed">
          {t("quiz.groundedText", "Grounded against official MoSPI documentation & verified statistical textbooks.")}
        </p>
      </form>

      {/* Review Queue & Drafts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="font-display text-xl font-bold text-on-surface">
              {t("quiz.draftItemsTitle", "Draft Items for Review")} ({items.length})
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {t("quiz.draftItemsDesc", "Review and approve AI-generated questions before publishing to the live assessment pool.")}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-outline-variant/30 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-on-surface-variant/60 mx-auto" />
            <h4 className="font-display text-base font-bold text-on-surface">
              {t("quiz.noDraftsTitle", "No draft questions in queue")}
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {t("quiz.noDraftsDesc", "Use the generation form on the left to create new AI-grounded assessment questions.")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isPublished = item.status === "published";
              return (
                <div
                  key={item.id}
                  className="glass-panel p-6 rounded-3xl border border-outline-variant/30 space-y-4 hover:border-primary-container/30 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-caps uppercase font-bold tracking-wider ${
                          isPublished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {tEntity(item.status)}
                      </span>
                      <span className="text-[11px] font-label-caps text-on-surface-variant px-2 py-0.5 rounded-md bg-surface-container-high">
                        {tEntity(item.difficulty)}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-on-surface-variant">
                      ID: {item.id}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-on-surface leading-relaxed">
                    {item.prompt}
                  </p>

                  {item.validation && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        item.validation.ok
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {item.validation.ok ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>
                        {item.validation.ok
                          ? t("quiz.passedChecks", "Passed official duplicate & hallucination checks")
                          : item.validation.issues.join("; ")}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant font-label-caps">
                      {isPublished ? t("quiz.activeInPool", "Active in assessment pool") : t("quiz.awaitingApproval", "Awaiting faculty approval")}
                    </span>

                    {!isPublished ? (
                      <button
                        type="button"
                        onClick={() => publish(item.id)}
                        className="glow-button px-4 py-1.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("quiz.publishQuestion", "Publish Question")}
                      </button>
                    ) : (
                      <span className="text-xs font-label-caps text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("quiz.published", "Published")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
