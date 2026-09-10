import { db } from "@/db/store";
import { Notice, Stat } from "@/components/app-shell";
import { analyzeGaps } from "@/lib/recommendations/engine";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Users,
  Award,
  BookOpen,
} from "lucide-react";

export default function RiskPage() {
  const employees = db.listEmployees();
  const risks = employees.flatMap((emp) => {
    const gaps = analyzeGaps({
      competencies: db.listCompetencies(),
      employeeCompetencies: db.listEmployeeCompetencies(emp.id),
      roleCompetencies: db.listRoleCompetencies(emp.targetRoleId),
    }).filter((g) => g.gap >= 20);
    return gaps.map((g) => ({
      employee: emp.name,
      department: db.getDepartment(emp.departmentId)?.name || "Statistical Division",
      departmentCode: db.getDepartment(emp.departmentId)?.code || "STAT",
      role: db.getRole(emp.targetRoleId)?.name || "Statistical Officer",
      ...g,
    }));
  });

  const highDeficit = risks.filter((r) => r.gap >= 35).length;
  const mediumDeficit = risks.filter((r) => r.gap < 35).length;

  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-outline-variant/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 font-label-caps text-xs text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            WORKFORCE SKILL RISK SURVEILLANCE
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
            Workforce Skill Risk Matrix
          </h1>
          <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
            Identifies systemic and individual skill bottlenecks where required role proficiency substantially exceeds current assessed evidence (Gap ≥ 20 points).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/trainer/courses"
            className="glow-button inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-label-caps uppercase tracking-wider font-bold text-black shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            Deploy Interventions
          </Link>
        </div>
      </header>

      {/* Risk KPI Ribbon */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Stat label="Total At-Risk Competencies" value={String(risks.length)} hint="Gaps exceeding 20 points" />
        <Stat label="Severe Deficit (≥35 pts)" value={String(highDeficit)} hint="Requires immediate course assignment" />
        <Stat label="Moderate Deficit (20–34 pts)" value={String(mediumDeficit)} hint="Monitor in next quarterly review" />
      </div>

      {/* Risk Items List */}
      <section className="glass-panel p-6 md:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="font-display text-xl font-bold text-on-surface">
              High-Risk Competency Deficits ({risks.length})
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Ranked by gap severity against target designation requirements
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
                    Target Role: <strong className="text-on-surface">{r.role}</strong> · Competency:{" "}
                    <strong className="text-primary">{r.competencyName}</strong>
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
                      Gap: -{r.gap.toFixed(0)} pts
                    </span>
                    <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
                      Evidenced: {r.currentScore.toFixed(0)} / Required: {r.requiredScore}
                    </p>
                  </div>
                  <Link
                    href={`/trainer/courses?q=${encodeURIComponent(r.competencyName)}`}
                    className="glow-button-secondary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-label-caps uppercase font-bold"
                  >
                    Assign Course
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
