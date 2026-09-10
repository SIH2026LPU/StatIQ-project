"use client";

import Link from "next/link";
import { Notice, Stat } from "@/components/app-shell";
import { EnrollButton } from "@/components/enroll-button";
import { getCourseThumbnail } from "@/lib/course-images";
import { useTranslation } from "@/components/language/language-provider";

interface LearnerDashboardViewProps {
  emp: {
    id: string;
    name: string;
    designation: string | null;
    department: string | null;
    jobRoleId: string | null;
    jobRole: string | null;
    synthetic?: boolean;
    careerGoal?: string;
  };
  gaps: Array<{
    competencyId: string;
    competencyName: string;
    currentScore: number;
    requiredLevel: number;
    gap: number;
    isCritical?: boolean;
    severity?: string;
  }>;
  readiness: number;
  unreadCount?: number;
  enrollments?: Array<{
    id: string;
    courseId: string;
    status: string;
    learningHours: number;
    course?: {
      id: string;
      title: string;
      provider: string;
      durationHours: number;
    };
  }>;
  categoryScores?: Array<{
    categoryId: string;
    name: string;
    score: number;
  }>;
  recommendations?: Array<{
    courseId: string;
    course?: {
      id: string;
      title: string;
      provider: string;
      durationHours: number;
    };
    explanation: { why: string };
  }>;
}

export function LearnerDashboardView({
  emp,
  gaps,
  readiness,
  unreadCount = 0,
  enrollments = [],
  categoryScores = [],
  recommendations = [],
}: LearnerDashboardViewProps) {
  const { t } = useTranslation();
  const critical = gaps.filter((g) => g.isCritical || g.severity === "critical" || g.gap >= 25);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Cohort Banner */}
      <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
            🔥
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">
              {t("learner.welcomeBack", "Your cohort is active!")}
            </p>
            <p className="text-xs text-on-surface-variant">
              Your department completed 12 courses this week. Keep up the momentum.
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-lg font-display font-bold text-primary-container">3 Day</p>
          <p className="text-[10px] font-label-caps text-on-surface-variant">LEARNING STREAK</p>
        </div>
      </div>

      <Notice />

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
          {t("learner.title", "Learner Workspace")} · {emp.synthetic ? "DEMO DATA" : "LIVE"}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight flex items-center gap-4">
          {emp.name}
          {unreadCount > 0 && (
            <Link
              href="/learner/notifications"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              <span>{unreadCount} {t("nav.notifications", "new")}</span>
            </Link>
          )}
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          {emp.designation} · {emp.department} <br />
          <span className="text-on-surface font-medium mt-1 inline-block">
            {t("learner.targetRole", "Target Role")}: {emp.jobRole}
          </span>
          {emp.careerGoal && <span className="block text-sm mt-2 opacity-80">{emp.careerGoal}</span>}
        </p>
      </header>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t("learner.readinessScore", "Role readiness")}
          value={`${readiness.toFixed(0)}%`}
          hint={emp.jobRole ?? ""}
        />
        <Stat
          label={t("learner.activeGaps", "Skill gaps")}
          value={String(gaps.filter((g) => g.gap > 0).length)}
        />
        <Stat
          label={t("admin.criticalRisks", "Critical gaps")}
          value={String(critical.length)}
          hint="Required minus current ≥ 25"
        />
        <Stat
          label={t("passport.verifiedSkills", "Competencies scored")}
          value={String(gaps.length)}
        />
      </div>

      {/* Continue Learning Section */}
      {enrollments.filter((e) => e.status === "enrolled").length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-on-surface">
              {t("learner.continueLearning", "Continue Learning")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments
              .filter((e) => e.status === "enrolled")
              .slice(0, 3)
              .map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;
                const progress = Math.min(80, Math.max(10, course.id.length * 5));

                return (
                  <div
                    key={enrollment.id}
                    className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-primary-container/30 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={getCourseThumbnail(course.title)}
                          alt=""
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-sm line-clamp-2 leading-tight group-hover:text-primary-container transition-colors mb-1">
                          {course.title}
                        </h3>
                        <p className="text-[10px] font-label-caps text-on-surface-variant">
                          {course.provider.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-on-surface-variant">{progress}% {t("common.completed", "Complete")}</span>
                        <span className="text-on-surface-variant">{course.durationHours} hrs total</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden mb-4" dir="ltr">
                        <div
                          className="h-full bg-primary-container rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <Link
                        href={`/learner/courses/${course.id}/play`}
                        className="glow-button w-full py-2 rounded-full font-label-caps tracking-widest text-[10px] font-bold block text-center mt-2 text-black"
                      >
                        {t("learner.continueLearning", "RESUME COURSE")}
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Skill Gaps Breakdown */}
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="glass-panel rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-2xl text-on-surface font-bold tracking-tight">
            {t("learner.activeGaps", "Gaps vs Target Role")}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1 mb-6">
            Competencies where you fall short of the required proficiency level.
          </p>

          <ul className="space-y-1">
            {gaps.slice(0, 8).map((gap) => (
              <li
                key={gap.competencyId}
                className="flex justify-between items-center border-b border-white/5 py-4 last:border-0 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors group"
              >
                <span className="text-sm font-medium text-on-surface group-hover:text-primary-container transition-colors">
                  {gap.competencyName}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-label-caps tracking-widest text-on-surface">
                    {gap.currentScore} <span className="text-on-surface-variant/50">/</span> {gap.requiredLevel}
                  </span>
                  <span className="text-xs text-error bg-error/10 px-2 py-0.5 rounded font-label-caps">
                    GAP: {gap.gap}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/learner/path"
              className="glow-button-secondary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-label-caps font-bold tracking-widest"
            >
              {t("learner.recommendedPaths", "VIEW LEARNING PATH")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </article>

        {/* Category Scores / Domain Breakdown */}
        {categoryScores.length > 0 ? (
          <article className="glass-panel rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-2xl text-on-surface font-bold tracking-tight">
              {t("passport.filterDomain", "Domain Category Scores")}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1 mb-6">
              Your current proficiency aggregated by major domains.
            </p>

            <ul className="space-y-5">
              {categoryScores.map((cat) => (
                <li key={cat.categoryId} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-on-surface group-hover:text-primary-container transition-colors">
                      {cat.name}
                    </span>
                    <span className="font-label-caps text-on-surface-variant">
                      {cat.score ? cat.score.toFixed(0) : "—"}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-container-high border border-white/5 overflow-hidden" dir="ltr">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-container/80 to-primary-container transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(cat.score, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ) : recommendations.length > 0 ? (
          <article className="glass-panel rounded-2xl p-6 md:p-8 border-t-[3px] border-t-secondary-container flex flex-col">
            <h2 className="font-display text-2xl text-on-surface font-bold tracking-tight">
              {t("learner.recommendedPaths", "Recommended Learning")}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1 mb-6">
              Courses dynamically selected to close your specific skill gaps.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mt-4">
              {recommendations.slice(0, 4).map((rec) => (
                <li
                  key={rec.courseId}
                  className="group glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 hover:border-primary-container/30 transition-colors"
                >
                  <Link
                    href={`/learner/courses/${rec.courseId}`}
                    className="block h-32 relative overflow-hidden bg-surface-container-high shrink-0"
                  >
                    <img
                      src={getCourseThumbnail(rec.course?.title || "")}
                      alt={rec.course?.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold font-label-caps text-white border border-white/10">
                      {rec.course?.durationHours} HRS
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/learner/courses/${rec.courseId}`}>
                      <h3 className="font-bold text-on-surface text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary-container transition-colors">
                        {rec.course?.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-4 flex-1">
                      {rec.explanation.why}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[10px] font-label-caps font-bold text-on-surface-variant px-2 py-0.5 rounded-full bg-surface-container">
                        {rec.course?.provider.toUpperCase()}
                      </span>
                      <EnrollButton courseId={rec.courseId} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </section>
    </div>
  );
}
