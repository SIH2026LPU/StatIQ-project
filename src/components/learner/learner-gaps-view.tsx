"use client";

import { useTranslation } from "@/components/language/language-provider";
import { Notice } from "@/components/app-shell";
import { TargetRoleForm } from "@/components/target-role-form";
import { Target, BrainCircuit, AlertTriangle, CheckCircle } from "lucide-react";

interface GapItem {
  competencyId: string;
  name: string;
  domain: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  priority: number;
}

interface LearnerGapsViewProps {
  currentRoleName: string;
  targetRoleId: string | null;
  roles: Array<{ id: string; name: string }>;
  gaps: GapItem[];
  explanation: string;
}

export function LearnerGapsView({
  currentRoleName,
  targetRoleId,
  roles,
  gaps,
  explanation,
}: LearnerGapsViewProps) {
  const { t, tEntity } = useTranslation();

  const highPriority = gaps.filter((g) => g.gap > 0).sort((a, b) => b.priority - a.priority);
  const strengths = gaps.filter((g) => g.gap === 0);

  // Group by domain
  const byDomain = gaps.reduce((acc: Record<string, GapItem[]>, gap) => {
    if (!acc[gap.domain]) acc[gap.domain] = [];
    acc[gap.domain].push(gap);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-up pb-24">
      <Notice />
      
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <Target className="w-3.5 h-3.5" />
          {t("gaps.badge", "SKILL GAP ANALYSIS")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("gaps.title", "Competency Profile")}
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          {t("gaps.subtitle", "Understand the difference between your current competencies and the competencies required for your target role.")}
        </p>
      </header>

      {/* Target Role Selector & High-level Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden lg:col-span-1 border-t-[3px] border-t-primary-container">
          <div className="relative z-10 space-y-4">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">
                {t("gaps.currentRole", "CURRENT ROLE")}
              </p>
              <p className="text-on-surface font-medium">{tEntity(currentRoleName)}</p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">
                {t("gaps.targetRole", "TARGET ROLE")}
              </p>
              <TargetRoleForm
                currentId={targetRoleId || ""}
                roles={roles.map((r) => ({ id: r.id, name: tEntity(r.name) }))}
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col justify-center bg-gradient-to-br from-surface to-primary-container/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-container/10 rounded-xl text-primary-container shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-2">
                {t("gaps.aiExplanation", "AI Gap Explanation")}
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {explanation || "Calculating..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border-t-[3px] border-t-error">
          <div className="flex items-center gap-2 mb-6 text-error">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-display text-xl font-bold text-on-surface">
              {t("gaps.criticalGaps", "Critical Gaps")} ({highPriority.length})
            </h3>
          </div>
          <div className="space-y-4">
            {highPriority.slice(0, 6).map((g) => (
              <div key={g.competencyId} className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface text-sm">{tEntity(g.name)}</span>
                  <span className="text-xs font-label-caps px-2 py-0.5 rounded bg-error/10 text-error">
                    {t("gaps.gap", "Gap")}: {g.gap}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>{t("gaps.current", "Current")}: {g.currentScore}</span>
                  <span>{t("gaps.required", "Required")}: {g.targetScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border-t-[3px] border-t-primary-container">
          <div className="flex items-center gap-2 mb-6 text-primary-container">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-display text-xl font-bold text-on-surface">
              {t("gaps.strengths", "Strengths")} ({strengths.length})
            </h3>
          </div>
          <div className="space-y-4">
            {strengths.slice(0, 6).map((g) => (
              <div key={g.competencyId} className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface text-sm">{tEntity(g.name)}</span>
                  <span className="text-xs font-label-caps px-2 py-0.5 rounded bg-primary-container/10 text-primary-container">
                    {t("common.verified", "VERIFIED")}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>{t("gaps.current", "Current")}: {g.currentScore}</span>
                  <span>{t("common.score", "Mastery")}: 100%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
