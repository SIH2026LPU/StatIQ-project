"use client";

import { useState } from "react";
import { Sparkles, BrainCircuit, Loader2, RefreshCw } from "lucide-react";
import { QuizRunner } from "./quiz-runner";
import { useTranslation } from "@/components/language/language-provider";

export function AiAssessmentGenerator({
  competencies,
}: {
  competencies: Array<{ id: string; name: string }>;
}) {
  const { t, tEntity } = useTranslation();
  const [topic, setTopic] = useState("National Accounts & Price Index Compilation");
  const [competencyId, setCompetencyId] = useState(competencies[0]?.id || "c-stat-methods");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[] | null>(null);
  const [activeQuiz, setActiveQuiz] = useState(false);

  const presetTopics = [
    { title: "WPI & CPI Index Numbers", comp: "c-stat-methods", diff: "medium" as const },
    { title: "PLFS Labour Force Sampling", comp: "c-sampling", diff: "hard" as const },
    { title: "ASI Microdata & Validation", comp: "c-microdata", diff: "medium" as const },
    { title: "Statistical Disclosure Control", comp: "c-data-gov", diff: "easy" as const },
  ];

  async function handleGenerate() {
    setLoading(true);
    setGeneratedQuestions(null);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, competencyId, difficulty, count }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setActiveQuiz(true);
      }
    } catch (err) {
      console.error("AI quiz generation error", err);
    } finally {
      setLoading(false);
    }
  }

  if (activeQuiz && generatedQuestions) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
            <Sparkles className="w-3.5 h-3.5" />
            {t("assessments.liveGenerated", "LIVE AI GENERATED ASSESSMENT")} · {tEntity(difficulty).toUpperCase()}
          </div>
          <button
            onClick={() => { setActiveQuiz(false); setGeneratedQuestions(null); }}
            className="text-xs font-label-caps text-on-surface-variant hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-white/5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("assessments.newAssessment", "CREATE NEW TEST")}
          </button>
        </div>
        <div className="glass-panel rounded-3xl p-6 md:p-10 border-t-[3px] border-t-primary-container">
          <QuizRunner assessmentId="ai-practice" questions={generatedQuestions} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border-t-[3px] border-t-primary-container space-y-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
            <Sparkles className="w-3.5 h-3.5" />
            {t("assessments.engineBadge", "AI EVALUATION ENGINE")}
          </div>
          <h2 className="font-display text-2xl font-bold text-on-surface">
            {t("assessments.generateQuestions", "Generate Custom AI Practice Test")}
          </h2>
          <p className="text-on-surface-variant text-sm max-w-xl">
            {t("assessments.subtitle", "Generate authentic MCQs tailored to specific MoSPI statistical methodologies, sample survey designs, or national accounting standards.")}
          </p>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="space-y-2">
        <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider">
          {t("assessments.quickTopics", "Quick Topics")}
        </p>
        <div className="flex flex-wrap gap-2">
          {presetTopics.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setTopic(p.title); setDifficulty(p.diff); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                topic === p.title
                  ? "bg-primary-container/20 border-primary-container text-primary-container shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                  : "bg-surface-container border-white/5 text-on-surface-variant hover:text-on-surface hover:border-white/20"
              }`}
            >
              {tEntity(p.title)}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid sm:grid-cols-3 gap-4 pt-2">
        <div className="space-y-2 sm:col-span-1">
          <label className="text-xs font-label-caps text-on-surface-variant uppercase">
            {t("assessments.topicFocus", "TOPIC / FOCUS AREA")}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
            placeholder={t("assessments.topicPlaceholder", "e.g. Laspeyres Index Formulation")}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-label-caps text-on-surface-variant uppercase">
            {t("assessments.difficulty", "DIFFICULTY")}
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
          >
            <option value="easy">{t("passport.level1", "Beginner (Foundational)")}</option>
            <option value="medium">{t("passport.level2", "Intermediate (Applied)")}</option>
            <option value="hard">{t("passport.level3", "Advanced (Expert / ISS)")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-label-caps text-on-surface-variant uppercase">
            {t("assessments.questionCount", "QUESTION COUNT")}
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-container"
          >
            <option value={3}>3 {t("assessments.questionsQuick", "Questions (Quick Check)")}</option>
            <option value={4}>4 {t("assessments.questionsStandard", "Questions (Standard)")}</option>
            <option value={5}>5 {t("assessments.questionsInDepth", "Questions (In-Depth)")}</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="glow-button px-8 py-3 rounded-xl font-label-caps text-xs font-bold tracking-widest flex items-center gap-2 disabled:opacity-50 text-black uppercase"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("assessments.generatingMcqs", "GENERATING MCQS WITH AI...")}
            </>
          ) : (
            <>
              <BrainCircuit className="w-4 h-4" />
              {t("assessments.startPracticeTest", "START AI PRACTICE TEST")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
