"use client";

import Link from "next/link";
import { Activity, ArrowRight, BookOpen, CheckCircle2, Sparkles, Award } from "lucide-react";
import { AiAssessmentGenerator } from "@/components/ai-assessment-generator";
import { useTranslation } from "@/components/language/language-provider";

export interface EnrolledAssessmentItem {
  id: string;
  title: string;
  courseId?: string;
  courseTitle?: string;
  provider?: string;
  questionCount: number;
  adaptive: boolean;
  status: string;
  progressPercent: number;
}

export interface AssessmentItem {
  id: string;
  title: string;
  courseId?: string;
  courseTitle?: string;
  provider?: string;
  questionCount: number;
  adaptive: boolean;
}

export function LearnerAssessmentsView({
  enrolledAssessments = [],
  assessments = [],
  competencies = [],
}: {
  enrolledAssessments?: EnrolledAssessmentItem[];
  assessments: AssessmentItem[];
  competencies: Array<{ id: string; name: string }>;
}) {
  const { t, tEntity } = useTranslation();

  return (
    <div className="space-y-10 animate-fade-up max-w-5xl mx-auto pb-16">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-fixed-dim">
          <Activity className="w-4 h-4 text-secondary-fixed-dim" />
          {t("assessments.title", "ADAPTIVE EVALUATION ENGINE")}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {t("nav.assessments", "Competency Assessments")}
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          {t("assessments.subtitle", "Take official evaluations for your enrolled courses, benchmark tests, or generate live AI practice tests to validate and elevate your statistical competency scores.")}
        </p>
      </header>

      {/* 1. Enrolled Course Assessments Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {t("assessments.enrolledTitle", "My Enrolled Course Assessments")}
            </h2>
          </div>
          <span className="text-xs font-label-caps text-primary-container font-bold px-2.5 py-1 rounded-full bg-primary-container/10 border border-primary-container/30">
            {enrolledAssessments.length} {t("assessments.activeModules", "ACTIVE MODULES")}
          </span>
        </div>

        {enrolledAssessments.length > 0 ? (
          <ul className="space-y-4">
            {enrolledAssessments.map((item) => (
              <li
                key={item.id}
                className="glass-panel glass-panel-interactive rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group border-l-4 border-l-primary-container hover:border-primary-container/40"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {item.provider && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase font-bold tracking-wider bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                        {item.provider.toUpperCase()}
                      </span>
                    )}
                    <span className="text-[11px] font-label-caps text-primary-container font-semibold">
                      ENROLLED MODULE
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-on-surface group-hover:text-primary-container transition-colors">
                    {tEntity(item.title)}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-xs font-label-caps text-on-surface-variant/80 bg-surface-container-low px-2.5 py-1 rounded border border-white/5 uppercase">
                      {item.questionCount} {t("assessments.questions", "Questions")}
                    </span>
                    <span className="text-xs font-label-caps px-2.5 py-1 rounded border uppercase bg-secondary-container/10 border-secondary-container/30 text-secondary-fixed-dim">
                      {item.adaptive ? t("assessments.adaptiveMode", "Adaptive Mode") : t("assessments.fixedMode", "Fixed Mode")}
                    </span>
                    <span className="text-xs font-label-caps text-on-surface-variant bg-surface-container px-2.5 py-1 rounded border border-white/5 uppercase">
                      Progress: {item.progressPercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/learner/assessments/${item.id}`}
                    className="glow-button inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label-caps text-label-caps tracking-widest font-bold whitespace-nowrap text-black shadow-md"
                  >
                    {item.progressPercent >= 100 ? t("assessments.retakeTest", "RETAKE TEST") : t("assessments.startTest", "START TEST")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-white/10 space-y-3">
            <BookOpen className="w-8 h-8 text-on-surface-variant/50 mx-auto" />
            <p className="text-sm text-on-surface-variant">
              You haven't enrolled in any statistical courses yet. Explore the catalogue to take course evaluations.
            </p>
            <Link
              href="/learner/courses"
              className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-label-caps uppercase font-bold"
            >
              Explore Course Catalogue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* 2. AI Practice Generator */}
      <AiAssessmentGenerator competencies={competencies} />

      {/* 3. Official Benchmark Assessments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-on-surface">
            {t("assessments.benchmarksTitle", "Official Course & Benchmark Tests")}
          </h2>
          <span className="text-xs font-label-caps text-on-surface-variant">
            {assessments.length} {t("assessments.benchmarksAvailable", "BENCHMARKS AVAILABLE")}
          </span>
        </div>

        <ul className="space-y-4">
          {assessments.map((item) => (
            <li
              key={item.id}
              className="glass-panel glass-panel-interactive rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.provider && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase font-bold tracking-wider bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                      {item.provider.toUpperCase()}
                    </span>
                  )}
                  <span className="text-[11px] font-label-caps text-on-surface-variant">
                    OFFICIAL BENCHMARK
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-on-surface group-hover:text-primary-container transition-colors">
                  {tEntity(item.title)}
                </h3>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-label-caps text-on-surface-variant/80 bg-surface-container-low px-2 py-1 rounded border border-white/5 uppercase">
                    {item.questionCount} {t("assessments.questions", "Questions")}
                  </span>
                  <span
                    className={`text-xs font-label-caps px-2 py-1 rounded border uppercase ${
                      item.adaptive
                        ? "bg-secondary-container/10 border-secondary-container/30 text-secondary-fixed-dim"
                        : "bg-surface-container border-white/10 text-on-surface-variant"
                    }`}
                  >
                    {item.adaptive ? t("assessments.adaptiveMode", "Adaptive Mode") : t("assessments.fixedMode", "Fixed Mode")}
                  </span>
                </div>
              </div>

              <Link
                href={`/learner/assessments/${item.id}`}
                className="glow-button-secondary inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label-caps text-label-caps tracking-widest font-bold whitespace-nowrap"
              >
                {t("assessments.startTest", "START TEST")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
