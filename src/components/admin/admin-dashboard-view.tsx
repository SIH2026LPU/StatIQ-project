"use client";

import Link from "next/link";
import { Notice, Stat } from "@/components/app-shell";
import { useTranslation } from "@/components/language/language-provider";
import {
  Shield,
  BarChart3,
  AlertTriangle,
  Radar,
  ArrowRight,
  Sparkles,
  Database,
} from "lucide-react";

interface EmergingSkill {
  id: string;
  name: string;
  description: string;
  averageScore: number;
  coverage: number;
}

interface AdminDashboardViewProps {
  totalLearners: number;
  activeLearning: number;
  competencyAverage: number;
  criticalGapCount: number;
  completionRate: number;
  assessmentAverage: number;
  emerging: EmergingSkill[];
}

export function AdminDashboardView({
  totalLearners,
  activeLearning,
  competencyAverage,
  criticalGapCount,
  completionRate,
  assessmentAverage,
  emerging,
}: AdminDashboardViewProps) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
            <Shield className="w-3.5 h-3.5" />
            {t("admin.commandCenterBadge", "ADMIN COMMAND CENTER · WORKFORCE INTELLIGENCE")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            {t("admin.title", "Workforce Command Center")}
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            {t("admin.subtitle", "Macro organizational analytics, competency heatmaps, workforce skill risk surveillance, and MoSPI data pipeline telemetry.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/assistant"
            className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            {t("admin.aiAssistant", "AI Analytics Assistant")}
          </Link>
          <Link
            href="/admin/data"
            className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
          >
            <Database className="w-4 h-4" />
            {t("admin.dataControlCenter", "Data Control Center")}
          </Link>
        </div>
      </header>

      {/* Executive KPI Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Stat
          label={t("admin.totalUsers", "Total Statistical Cadre")}
          value={String(totalLearners)}
          hint={t("admin.enrolledOfficersHint", "Enrolled officers across all divisions")}
        />
        <Stat
          label={t("admin.activeLearningHours", "Active Learning Hours")}
          value={String(activeLearning)}
          hint={t("admin.engagedLearningHint", "Currently engaged in learning modules")}
        />
        <Stat
          label={t("admin.averageCompetencyScore", "Average Competency Score")}
          value={`${competencyAverage.toFixed(0)}/100`}
          hint={t("admin.benchmarkDoptHint", "Benchmark DoPT official score")}
        />
        <Stat
          label={t("admin.criticalSkillGaps", "Critical Skill Gaps")}
          value={String(criticalGapCount)}
          hint={t("admin.deficitsActionHint", "Deficits ≥ 20 points requiring action")}
        />
        <Stat
          label={t("admin.curriculumCompletion", "Curriculum Completion")}
          value={`${Math.round(completionRate * 100)}%`}
          hint={t("admin.targetGoalHint", "Target goal: 85% by Q4")}
        />
        <Stat
          label={t("admin.assessmentAverage", "Assessment Average")}
          value={`${assessmentAverage.toFixed(0)}%`}
          hint={t("admin.aiQuizPerformanceHint", "AI-evaluated quiz performance")}
        />
      </div>

      {/* Quick Access Modules */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/heatmap"
          className="glass-panel glass-panel-interactive p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary font-bold">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                {t("nav.heatmap", "Competency Heatmap")}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t("admin.deptDomainMatrix", "Department × Domain Matrix")}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-primary transition-all" />
        </Link>

        <Link
          href="/admin/risk"
          className="glass-panel glass-panel-interactive p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-fixed-dim font-bold">
              <AlertTriangle className="w-5 h-5 text-secondary-fixed-dim" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-on-surface group-hover:text-secondary-fixed-dim transition-colors">
                {t("nav.skillRisk", "Skill Risk Matrix")}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t("admin.atRiskRolesDivisions", "At-risk roles & divisions")}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-secondary-fixed-dim transition-all" />
        </Link>

        <Link
          href="/admin/data/mospi-explorer"
          className="glass-panel glass-panel-interactive p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary-fixed-dim font-bold">
              <Radar className="w-5 h-5 text-tertiary-fixed-dim" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-on-surface group-hover:text-tertiary-fixed-dim transition-colors">
                {t("admin.mospiDataExplorer", "MoSPI Data Explorer")}
              </p>
              <p className="text-xs text-on-surface-variant">
                {t("admin.liveEsankhyikiQueries", "Live eSankhyiki queries")}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-tertiary-fixed-dim transition-all" />
        </Link>
      </div>

      {/* Emerging Skill Radar Section */}
      <section className="glass-panel p-6 md:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-on-surface">
                {t("admin.emergingSkillsRadar", "Emerging Statistical Skills Radar")}
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {t("admin.emergingSkillsDesc", "High-growth competency domains benchmarked for National Statistical Commission priority modernization.")}
            </p>
          </div>
          <Link
            href="/admin/heatmap"
            className="glow-button-secondary px-4 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
          >
            {t("admin.fullHeatmap", "Full Heatmap")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {emerging.map((item) => {
            const coveragePct = Math.round(item.coverage * 100);
            return (
              <div
                key={item.id}
                className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-on-surface">{tEntity(item.name)}</span>
                  <span className="font-mono text-primary font-bold text-xs">
                    {t("common.score", "Score")}: {item.averageScore.toFixed(0)}/100
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <div className="space-y-1 pt-2 border-t border-outline-variant/20">
                  <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant">
                    <span>{t("admin.workforceCoverage", "Workforce Evidenced Coverage")}</span>
                    <span className="font-mono">{coveragePct}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${coveragePct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
