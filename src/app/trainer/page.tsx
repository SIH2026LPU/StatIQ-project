import { db } from "@/db/store";
import { Notice, Stat } from "@/components/app-shell";
import { learnerSnapshot } from "@/lib/services/intelligence";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function TrainerHome() {
  const learners = db.listEmployees().filter((e) => e.id !== "emp-ravi");
  const snaps = learners.map(learnerSnapshot);
  const weak = snaps.flatMap((s) =>
    s.gaps.filter((g) => g.severity === "critical").map((g) => ({
      name: s.employee.name,
      department: db.getDepartment(s.employee.departmentId)?.name || "Statistical Division",
      gap: g.competencyName,
      value: g.gap,
      currentScore: g.currentScore,
      targetScore: g.requiredScore,
    })),
  );
  const hours = db.listEnrollments().reduce((sum, e) => sum + e.learningHours, 0);
  const completed = db.listEnrollments().filter((e) => e.status === "completed").length;
  const total = db.listEnrollments().length;
  const avgReadiness =
    snaps.reduce((acc, s) => acc + s.readiness, 0) / (snaps.length || 1);

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Hero Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-xs text-primary-container">
            <GraduationCap className="w-3.5 h-3.5" />
            TRAINER COMMAND CENTRE · FACULTY WORKSPACE
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Workforce Training Dashboard
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            Monitor real-time officer progress, identify systemic skill gaps, build adaptive quizzes, and manage official NSSTA training paths.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/trainer/quiz"
            className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            AI Quiz Studio
          </Link>
          <Link
            href="/trainer/courses"
            className="glow-button-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
          >
            <BookOpen className="w-4 h-4" />
            Manage Courses
          </Link>
        </div>
      </header>

      {/* Stat Ribbon */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Active Learners" value={String(learners.length)} hint="Enrolled statistical officers" />
        <Stat label="Avg Role Readiness" value={`${Math.round(avgReadiness)}%`} hint="Across all competency domains" />
        <Stat label="Course Completion" value={total ? `${Math.round((completed / total) * 100)}%` : "—"} hint={`${completed} of ${total} enrolments`} />
        <Stat label="Total Training Hours" value={`${hours}h`} hint="Accumulated learning time" />
      </div>

      {/* Quick Launch Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/trainer/quiz"
          className="glass-panel glass-panel-interactive p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary font-bold">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                Generate Assessments
              </p>
              <p className="text-xs text-on-surface-variant">AI-grounded item bank</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-primary transition-all" />
        </Link>

        <Link
          href="/trainer/learners"
          className="glass-panel glass-panel-interactive p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-fixed-dim font-bold">
              <Users className="w-5 h-5 text-secondary-fixed-dim" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-on-surface group-hover:text-secondary-fixed-dim transition-colors">
                Learner Analytics
              </p>
              <p className="text-xs text-on-surface-variant">Individual skill matrices</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-secondary-fixed-dim transition-all" />
        </Link>

        <Link
          href="/trainer/microdata"
          className="glass-panel glass-panel-interactive p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary-fixed-dim font-bold">
              <Database className="w-5 h-5 text-tertiary-fixed-dim" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-on-surface group-hover:text-tertiary-fixed-dim transition-colors">
                Assign Microdata
              </p>
              <p className="text-xs text-on-surface-variant">MoSPI unit-level datasets</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-tertiary-fixed-dim transition-all" />
        </Link>
      </div>

      {/* Critical Competency Gaps Queue */}
      <article className="glass-panel rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-display text-xl font-bold text-on-surface">Critical Competency Gaps</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Learners requiring urgent training interventions benchmarked against DoPT official standards.
            </p>
          </div>
          <Link
            href="/trainer/learners"
            className="glow-button-secondary px-4 py-2 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold"
          >
            View Full Matrix
          </Link>
        </div>

        <div className="divide-y divide-outline-variant/15">
          {weak.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-on-surface">No critical competency gaps identified</p>
              <p className="text-xs text-on-surface-variant">All officers meet or exceed required competency thresholds.</p>
            </div>
          ) : (
            weak.slice(0, 8).map((item, i) => (
              <div
                key={i}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-bold text-xs text-on-surface">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-on-surface-variant font-label-caps mt-0.5">
                      {item.department} · <span className="text-on-surface">{item.gap}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-label-caps px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold">
                      Gap: -{item.value.toFixed(0)} pts
                    </span>
                    <p className="text-[10px] font-mono text-on-surface-variant mt-1">
                      Score: {item.currentScore}/{item.targetScore}
                    </p>
                  </div>
                  <Link
                    href={`/trainer/courses?q=${encodeURIComponent(item.gap)}`}
                    className="glow-button-secondary px-3 py-1.5 rounded-lg text-xs font-label-caps uppercase font-bold"
                  >
                    Assign Course
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
