"use client";

import Link from "next/link";
import { Notice, Stat } from "@/components/app-shell";
import { useTranslation } from "@/components/language/language-provider";
import {
  ShieldAlert,
  BookOpen,
  ArrowRight,
} from "lucide-react";

interface RiskItem {
  employee: string;
  department: string;
  departmentCode: string;
  role: string;
  competencyId: string;
  competencyName: string;
  currentScore: number;
  requiredScore: number;
  gap: number;
}

interface AdminRiskViewProps {
  risks: RiskItem[];
  highDeficit: number;
  mediumDeficit: number;
}

export function AdminRiskView({ risks, highDeficit, mediumDeficit }: AdminRiskViewProps) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 font-label-caps text-xs text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            {t("risk.badge", "WORKFORCE SKILL RISK SURVEILLANCE")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            {t("risk.title", "Workforce Skill Risk Matrix")}
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            {t("risk.subtitle", "Identifies systemic and individual skill bottlenecks where required role proficiency substantially exceeds current assessed evidence (Gap ≥ 20 points).")}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/trainer/courses"
            className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            {t("risk.deployInterventions", "Deploy Interventions")}
          </Link>
        </div>
      </header>

      {/* Risk KPI Ribbon */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Stat
          label={t("risk.totalAtRisk", "Total At-Risk Competencies")}
          value={String(risks.length)}
          hint={t("risk.gapsExceeding20Hint", "Gaps exceeding 20 points")}
        />
        <Stat
          label={t("risk.severeDeficit", "Severe Deficit (≥35 pts)")}
          value={String(highDeficit)}
          hint={t("risk.immediateCourseHint", "Requires immediate course assignment")}
        />
        <Stat
          label={t("risk.moderateDeficit", "Moderate Deficit (20–34 pts)")}
          value={String(mediumDeficit)}
          hint={t("risk.monitorNextQuarterHint", "Monitor in next quarterly review")}
        />
      </div>

      {/* Risk Items List */}
      <section className="glass-panel p-6 md:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface">
              {t("risk.highRiskDeficits", "High-Risk Competency Deficits")} ({risks.length})
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {t("risk.rankedBySeverity", "Ranked by gap severity against target designation requirements")}
            </p>
          </div>
        </div>

        <div className="divide-y divide-outline-variant/15">
          {risks.map((r, i) => {
            const isSevere = r.gap >= 35;
            return (
              <div
                key={i}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                      {r.employee}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-mono text-on-surface-variant">
                      {r.departmentCode}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-label-caps">
                    {t("profile.targetRole", "Target Role")}: <strong className="text-on-surface">{tEntity(r.role)}</strong> · {t("common.domain", "Competency")}:{" "}
                    <strong className="text-primary">{tEntity(r.competencyName)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                        isSevere
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {t("gaps.gap", "Gap")}: -{r.gap.toFixed(0)} {t("trainer.pts", "pts")}
                    </span>
                    <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
                      {t("gaps.current", "Evidenced")}: {r.currentScore.toFixed(0)} / {t("gaps.required", "Required")}: {r.requiredScore}
                    </p>
                  </div>
                  <Link
                    href={`/trainer/courses?q=${encodeURIComponent(r.competencyName)}`}
                    className="glow-button-secondary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-label-caps uppercase font-bold"
                  >
                    {t("trainer.assignCourse", "Assign Course")}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
