import { db } from "@/db/store";
import { Notice, Stat } from "@/components/app-shell";
import { learnerSnapshot } from "@/lib/services/intelligence";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function TrainerLearners() {
  const learners = db.listEmployees();
  const snaps = learners.map(learnerSnapshot);
  const avgReadiness =
    snaps.reduce((acc, s) => acc + s.readiness, 0) / (snaps.length || 1);

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-xs text-secondary-fixed-dim">
            <Users className="w-3.5 h-3.5 text-secondary-container" />
            OFFICER COHORT ANALYTICS & READINESS
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Learner Cohort Analytics
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            Track individual and batch readiness scores, diagnose competency weaknesses, and assign targeted iGOT / NSSTA interventions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            Batch Assign Courses
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Stat label="Total Officers" value={String(learners.length)} hint="Across all statistical divisions" />
        <Stat label="Cohort Average Readiness" value={`${Math.round(avgReadiness)}%`} hint="Benchmark target: 80%" />
        <Stat label="At-Risk Officers" value={String(snaps.filter((s) => s.readiness < 60).length)} hint="Readiness below 60%" />
      </div>

      {/* Table Section */}
      <section className="glass-panel rounded-3xl border border-outline-variant/30 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface">Statistical Cadre Roster</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live competency assessments and gap diagnoses for each officer
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Filter by officer name..."
                className="rounded-xl border border-outline-variant/40 bg-surface-container-high/60 pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-surface-container-high/70 border-b border-outline-variant/30 text-on-surface font-label-caps uppercase">
              <tr>
                <th className="py-3 px-4">Officer Name & Department</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Role Readiness</th>
                <th className="py-3 px-4">Primary Gap Area</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-on-surface-variant">
              {learners.map((emp) => {
                const snap = learnerSnapshot(emp);
                const top = snap.gaps.find((g) => g.gap > 0);
                const readiness = snap.readiness;
                const isHigh = readiness >= 75;
                const isMedium = readiness >= 50 && readiness < 75;

                return (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors align-middle">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center font-bold text-xs text-on-surface">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface text-sm">{emp.name}</p>
                          <p className="text-[11px] text-on-surface-variant">
                            {db.getDepartment(emp.departmentId)?.name || "Statistical Division"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-medium">
                        {snap.currentRole?.name || "Statistical Officer"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1.5 max-w-[130px]">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span
                            className={
                              isHigh
                                ? "text-emerald-500"
                                : isMedium
                                ? "text-amber-500"
                                : "text-rose-500"
                            }
                          >
                            {readiness.toFixed(0)}%
                          </span>
                          <span className="text-on-surface-variant text-[10px]">
                            {isHigh ? "Ready" : isMedium ? "Developing" : "Critical"}
                          </span>
                        </div>
                        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isHigh
                                ? "bg-emerald-500"
                                : isMedium
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, readiness))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {top ? (
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-on-surface block">
                            {top.competencyName}
                          </span>
                          <span className="text-[10px] font-mono text-rose-500 font-bold">
                            Deficit: -{top.gap.toFixed(0)} pts
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-500 font-medium">✓ No Gaps</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/trainer/courses?q=${encodeURIComponent(top?.competencyName || "")}`}
                        className="glow-button-secondary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-label-caps uppercase font-bold"
                      >
                        Assign Path
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
