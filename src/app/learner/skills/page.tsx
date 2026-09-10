import { redirect } from "next/navigation";
import { db } from "@/db/store";
import { getSession } from "@/lib/auth/session";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { TrendingUp, AlertTriangle, CheckCircle2, Target, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");
  const employee = db.getEmployee(session.employeeId);

  const snap = learnerSnapshot(employee);
  const criticalGaps = snap.gaps.filter((g) => g.severity === "critical");
  const moderateGaps = snap.gaps.filter((g) => g.severity === "moderate");
  const strengths = snap.gaps.filter((g) => g.severity === "strength");

  // Find courses that address each gap
  const gapCourseMap = new Map<string, string[]>();
  for (const gap of snap.gaps) {
    const courses = db.listCourseCompetencies()
      .filter((cc) => cc.competencyId === gap.competencyId)
      .map((cc) => cc.courseId);
    gapCourseMap.set(gap.competencyId, courses);
  }

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
          GAP ANALYSIS
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          Skill Gap Analysis
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          Your competency scores vs. what your target role requires. Scores are from your assessments — nothing is fabricated.
        </p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-6 border border-red-500/20 flex flex-col items-start gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <p className="font-display text-4xl font-bold text-red-400">{criticalGaps.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant">CRITICAL GAPS</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 flex flex-col items-start gap-2">
          <Target className="w-6 h-6 text-amber-400" />
          <p className="font-display text-4xl font-bold text-amber-400">{moderateGaps.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant">MODERATE GAPS</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 flex flex-col items-start gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <p className="font-display text-4xl font-bold text-emerald-400">{strengths.length}</p>
          <p className="text-xs font-label-caps text-on-surface-variant">STRENGTHS</p>
        </div>
      </div>

      {/* Domain breakdown */}
      {snap.categoryScores.map((cat) => {
        const catGaps = snap.gaps.filter((g) => {
          const comp = db.getCompetency(g.competencyId);
          return comp?.categoryId === cat.categoryId;
        });
        if (catGaps.length === 0) return null;
        return (
          <section key={cat.categoryId}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-on-surface">{cat.name}</h2>
              <span className="text-sm text-on-surface-variant">Avg: <strong className="text-on-surface">{Math.round(cat.score)}</strong>/100</span>
            </div>
            <div className="space-y-3">
              {catGaps.map((gap) => {
                const coveringCourses = (gapCourseMap.get(gap.competencyId) ?? []).slice(0, 2);
                return (
                  <div key={gap.competencyId} className="glass-panel rounded-2xl p-5 border border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-label-caps border ${severityColor[gap.severity]}`}>
                          {gap.severity.toUpperCase()}
                        </span>
                        <h3 className="font-bold text-on-surface">{gap.competencyName}</h3>
                      </div>
                      <div className="text-right text-xs text-on-surface-variant font-label-caps shrink-0">
                        {gap.currentScore} → {gap.requiredScore} required
                      </div>
                    </div>

                    {/* Score bar */}
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden mb-3">
                      <div className="flex h-full">
                        <div
                          className={`h-full rounded-full transition-all ${gap.severity === "critical" ? "bg-red-400" : gap.severity === "moderate" ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${gap.currentScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute h-3 w-0.5 bg-on-surface-variant/50 top-0 rounded-full" style={{ left: `${gap.requiredScore}%` }} />
                    </div>

                    {coveringCourses.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <BookOpen className="w-3.5 h-3.5 text-primary-container shrink-0" />
                        <span className="text-xs text-on-surface-variant">Closes gap:</span>
                        {coveringCourses.map((cId) => {
                          const course = db.getCourse(cId);
                          if (!course) return null;
                          return (
                            <Link key={cId} href={`/courses/${cId}`} className="text-xs text-primary-container hover:underline flex items-center gap-1">
                              {course.title} <ArrowRight className="w-3 h-3" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {snap.gaps.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">No gaps found</h2>
          <p className="text-on-surface-variant">Complete the competency assessment to generate your gap analysis.</p>
          <Link href="/learner/assessments" className="mt-6 inline-flex glow-button px-6 py-2.5 rounded-full font-label-caps text-black">
            Take Assessment
          </Link>
        </div>
      )}
    </div>
  );
}
