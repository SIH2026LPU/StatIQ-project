"use client";

import { useTranslation } from "@/components/language/language-provider";
import { Notice } from "@/components/app-shell";
import { EnrollButton } from "@/components/enroll-button";
import { Map, Clock, ArrowRight } from "lucide-react";

interface PathRec {
  courseId: string;
  course?: {
    id: string;
    title: string;
    description: string;
    provider: string;
  };
  explanation: {
    why: string;
    effortHours: number;
  };
}

interface PathProgramme {
  id: string;
  provider: string;
  title: string;
  description: string;
  durationDays: number;
  targetDesignation: string;
}

interface LearnerPathViewProps {
  careerGoal?: string | null;
  targetRoleName?: string;
  hours: number;
  recommendations: PathRec[];
  programmes: PathProgramme[];
}

export function LearnerPathView({
  careerGoal,
  targetRoleName,
  hours,
  recommendations,
  programmes,
}: LearnerPathViewProps) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-up">
      <Notice />
      
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-fixed-dim">
          <Map className="w-4 h-4 text-secondary-fixed-dim" />
          {t("path.badge", "RECOMMENDED CURRICULUM")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("path.title", "Personalised Learning Path")}
        </h1>
        {careerGoal && (
          <p className="max-w-2xl text-on-surface-variant text-lg">
            {t("path.goal", "Goal")}: <strong className="text-on-surface font-medium">{tEntity(careerGoal, careerGoal)}</strong>
          </p>
        )}
        <div className="inline-flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-lg border border-white/5">
          <Clock className="w-4 h-4 text-primary-container" />
          {t("path.fastestRoute", "Fastest route uses gap coverage, role relevance and effort.")} {t("path.estimatedHours", "Estimated hours for the first five steps")}: <strong>{hours} {t("common.hrsTotal", "hours")}</strong>.
        </div>
      </header>

      <ol className="mt-8 space-y-4">
        {recommendations.slice(0, 6).map((rec, index) => (
          <li key={rec.courseId} className="glass-panel glass-panel-interactive rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start group">
            <div className="w-12 h-12 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center font-display text-xl font-bold text-on-surface-variant group-hover:text-primary-container group-hover:border-primary-container/30 transition-colors shrink-0">
              {String(index + 1).padStart(2, "0")}
            </div>
            
            <div className="flex-1 space-y-3">
              <h2 className="font-display text-2xl text-on-surface font-bold leading-tight group-hover:text-primary-container transition-colors">
                {tEntity(rec.course?.title)}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-3xl">
                {tEntity(rec.course?.description, rec.course?.description)}
              </p>
              
              <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2 mt-4">
                <p className="text-sm font-medium text-on-surface">{t("path.whyRecommended", "Why this was recommended")}</p>
                <p className="text-sm text-on-surface-variant">{tEntity(rec.explanation.why, rec.explanation.why)}</p>
                
                <div className="flex flex-wrap items-center gap-2 pt-2">
                   <span className="px-2 py-1 bg-surface-container border border-white/5 rounded text-[10px] font-label-caps uppercase text-on-surface-variant">
                     {t("path.target", "Target")}: {tEntity(targetRoleName)}
                   </span>
                   <span className="px-2 py-1 bg-surface-container border border-white/5 rounded text-[10px] font-label-caps uppercase text-on-surface-variant">
                     {t("path.effort", "Effort")}: {rec.explanation.effortHours}h
                   </span>
                   <span className="px-2 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container rounded text-[10px] font-label-caps uppercase">
                     {t("path.provider", "Provider")}: {rec.course?.provider}
                   </span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 pt-2">
              <EnrollButton courseId={rec.courseId} />
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-12 space-y-6">
        <h2 className="font-display text-2xl text-on-surface font-bold flex items-center gap-2">
          {t("path.programmesTitle", "NSSTA / TPAC Programmes")}
          <ArrowRight className="w-5 h-5 text-on-surface-variant" />
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {programmes.map((p) => (
            <li key={p.id} className="glass-panel glass-panel-interactive rounded-2xl p-6 flex flex-col h-full">
              <div className="inline-block px-2 py-1 rounded bg-secondary-container/10 text-secondary-fixed-dim font-label-caps text-[10px] uppercase border border-secondary-container/20 w-max mb-3">
                {p.provider}
              </div>
              <p className="font-bold text-on-surface text-lg leading-tight mb-2">{tEntity(p.title)}</p>
              <p className="text-sm text-on-surface-variant mb-4 flex-1">{tEntity(p.description, p.description)}</p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant/80 border-t border-white/5 pt-4">
                <span>{p.durationDays} {t("path.days", "days")}</span>
                <span>{tEntity(p.targetDesignation)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
