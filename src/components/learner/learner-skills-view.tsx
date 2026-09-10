"use client";

import { useTranslation } from "@/components/language/language-provider";
import { TrendingUp, AlertTriangle, CheckCircle2, Target, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

interface GapData {
  competencyId: string;
  competencyName: string;
  currentScore: number;
  requiredScore: number;
  gap: number;
  severity: "critical" | "moderate" | "strength";
}

interface CategoryScoreData {
  categoryId: string;
  name: string;
  score: number;
}

interface LearnerSkillsViewProps {
  gaps: GapData[];
  categoryScores: CategoryScoreData[];
  gapCourseMap: Record<string, Array<{ id: string; title: string }>>;
}

export function LearnerSkillsView({
  gaps,
  categoryScores,
  gapCourseMap,
}: LearnerSkillsViewProps) {
  const { t, tEntity } = useTranslation();

  const criticalGaps = gaps.filter((g) => g.severity === "critical");
  const moderateGaps = gaps.filter((g) => g.severity === "moderate");
  const strengths = gaps.filter((g) => g.severity === "strength");

  const severityColor = {
    critical: "text-red-400 bg-red-400/10 border-red-400/30",
    moderate: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    strength: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  };

  return (
    <div className="space-y-10 animate-fade-up max-w-5xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <TrendingUp className="w-4 h-4" />
          {t("gaps.badge", "GAP ANALYSIS")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("gaps.title", "Skill Gap Analysis")}
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          {t("gaps.subtitle", "Your competency scores vs. what your target role requires. Scores are from your assessments.")}
        </p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-6 border border-red-500/20 flex flex-col items-start gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <p className="font-display text-4xl font-bold text-red-400">{criticalGaps.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant">{t("gaps.criticalGaps", "CRITICAL GAPS")}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 flex flex-col items-start gap-2">
          <Target className="w-6 h-6 text-amber-400" />
          <p className="font-display text-4xl font-bold text-amber-400">{moderateGaps.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant">{t("gaps.moderateGaps", "MODERATE GAPS")}</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 flex flex-col items-start gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <p className="font-display text-4xl font-bold text-emerald-400">{strengths.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant">{t("gaps.strengths", "STRENGTHS")}</p>
        </div>
      </div>

      {/* Domain breakdown */}
      {categoryScores.map((cat) => {
        const catGaps = gaps.filter((g) => g.gap >= 0);
        if (catGaps.length === 0) return null;
        return (
          <section key={cat.categoryId}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-on-surface">{tEntity(cat.name)}</h2>
              <span className="text-sm text-on-surface-variant">
                {t("common.score", "Avg")}: <strong className="text-on-surface">{Math.round(cat.score)}</strong>/100
              </span>
            </div>
            <div className="space-y-3">
              {catGaps.map((gap) => {
                const coveringCourses = (gapCourseMap[gap.competencyId] ?? []).slice(0, 2);
                return (
                  <div key={gap.competencyId} className="glass-panel rounded-2xl p-5 border border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-label-caps border ${severityColor[gap.severity]}`}>
                          {t(`gaps.${gap.severity}`, gap.severity.toUpperCase())}
                        </span>
                        <h3 className="font-bold text-on-surface">{tEntity(gap.competencyName)}</h3>
                      </div>
                      <div className="text-right text-xs text-on-surface-variant font-label-caps shrink-0">
                        {gap.currentScore} → {gap.requiredScore} {t("gaps.required", "required")}
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden mb-3" dir="ltr">
                      <div className="flex h-full">
                        <div
                          className={`h-full rounded-full transition-all ${gap.severity === "critical" ? "bg-red-400" : gap.severity === "moderate" ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${gap.currentScore}%` }}
                        />
                      </div>
                    </div>

                    {coveringCourses.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <BookOpen className="w-3.5 h-3.5 text-primary-container shrink-0" />
                        <span className="text-xs text-on-surface-variant">{t("learner.continueLearning", "Closes gap")}:</span>
                        {coveringCourses.map((course) => (
                          <Link key={course.id} href={`/courses/${course.id}`} className="text-xs text-primary-container hover:underline flex items-center gap-1">
                            {tEntity(course.title)} <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
