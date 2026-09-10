import { redirect } from "next/navigation";
import { Notice } from "@/components/app-shell";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { 
  ShieldCheck, 
  Award, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  FileCheck2,
  Sparkles,
  Printer
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const employee = db.resolveEmployeeForSession(session);
  const snap = learnerSnapshot(employee);
  const passport = snap.passport;

  const totalComps = passport.length;
  const advancedCount = passport.filter(p => p.score >= 75).length;
  const intermediateCount = passport.filter(p => p.score >= 50 && p.score < 75).length;
  const foundationalCount = passport.filter(p => p.score < 50).length;

  return (
    <div className="space-y-10 animate-fade-up max-w-5xl mx-auto pb-16">
      <Notice />

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 font-label-caps text-label-caps text-primary-container">
          <ShieldCheck className="w-4 h-4 text-primary-container" />
          VERIFIED DIGITAL CREDENTIAL · STATIQ FRAC
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
              Competency Passport
            </h1>
            <p className="mt-2 max-w-2xl text-on-surface-variant text-lg leading-relaxed">
              Official verified record of statistical competencies, assessment evidence, and target role readiness for {employee.name}.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/learner/assessments"
              className="glow-button px-6 py-2.5 rounded-xl font-label-caps text-xs font-bold tracking-wider flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              ELEVATE SCORES
            </Link>
          </div>
        </div>
      </header>

      {/* Passport Credential ID Card */}
      <div className="glass-panel rounded-3xl p-8 md:p-10 border-t-[3px] border-t-primary-container relative overflow-hidden bg-gradient-to-br from-surface-container-low via-surface to-primary-container/5 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Award className="w-72 h-72 text-primary-container" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-surface-container-high border-2 border-primary-container/40 flex items-center justify-center font-display text-4xl font-bold text-primary-container shadow-[0_0_25px_rgba(57,255,20,0.15)]">
              {employee.name.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="inline-block px-2.5 py-0.5 rounded bg-primary-container/20 text-primary-container text-[11px] font-label-caps font-bold">
                PASSPORT ID: STATIQ-{employee.id.slice(0, 8).toUpperCase()}
              </div>
              <h2 className="font-display text-3xl font-bold text-on-surface">{employee.name}</h2>
              <p className="text-sm text-on-surface-variant flex items-center gap-2">
                <span>{employee.designation}</span>
                <span>•</span>
                <span className="text-on-surface">{snap.department?.name || "Statistical Division"}</span>
              </p>
            </div>
          </div>

          {/* Readiness Gauge */}
          <div className="p-6 rounded-2xl bg-surface-container-high/80 border border-white/10 flex items-center gap-6 backdrop-blur-md">
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider">TARGET ROLE READINESS</p>
              <p className="font-display text-3xl font-bold text-primary-container mt-1">
                {Math.round(snap.readiness)}%
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{snap.targetRole?.name || "Lead Statistical Officer"}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary-container/10 border-2 border-primary-container flex items-center justify-center text-primary-container font-bold text-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Quick Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-xl bg-surface-container border border-white/5">
            <p className="text-[10px] font-label-caps text-on-surface-variant">TOTAL VERIFIED</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{totalComps}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Competencies</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container border border-primary-container/20">
            <p className="text-[10px] font-label-caps text-primary-container">ADVANCED MASTERY</p>
            <p className="font-display text-2xl font-bold text-primary-container mt-1">{advancedCount}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Score 75+</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container border border-secondary-container/20">
            <p className="text-[10px] font-label-caps text-secondary-container">INTERMEDIATE</p>
            <p className="font-display text-2xl font-bold text-secondary-container mt-1">{intermediateCount}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Score 50 - 74</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container border border-amber-500/20">
            <p className="text-[10px] font-label-caps text-amber-400">FOUNDATIONAL</p>
            <p className="font-display text-2xl font-bold text-amber-400 mt-1">{foundationalCount}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Score &lt; 50</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold text-on-surface">Domain Breakdown</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {snap.categoryScores.map(cat => (
            <div key={cat.categoryId} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface text-sm">{cat.name}</span>
                <span className="text-sm font-bold text-primary-container">{Math.round(cat.score)}/100</span>
              </div>
              <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-container/60 to-primary-container transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competencies Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl space-y-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-on-surface">Official Competency Matrix</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Empirical psychometric evidence calculated from verified benchmarks.</p>
          </div>
          <span className="text-xs font-label-caps text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-white/5">
            {passport.length} RECORDS
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-surface-container-low border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">COMPETENCY</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider">DOMAIN</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider text-center">PROFICIENCY</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider text-right">VERIFIED SCORE</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {passport.map((item) => {
                const score = Math.round(item.score);
                const level = score >= 75 ? "ADVANCED" : score >= 50 ? "INTERMEDIATE" : "FOUNDATIONAL";
                const badgeColor = score >= 75 
                  ? "bg-primary-container/10 border-primary-container/30 text-primary-container"
                  : score >= 50
                  ? "bg-secondary-container/10 border-secondary-container/30 text-secondary-container"
                  : "bg-amber-400/10 border-amber-400/30 text-amber-400";

                return (
                  <tr key={item.competencyId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface text-sm">{item.name}</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">{item.competencyId}</div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs font-medium capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-label-caps border font-bold ${badgeColor}`}>
                        {level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-display font-bold text-base text-on-surface">{score}/100</span>
                        <div className="w-20 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div 
                            className="h-full bg-primary-container" 
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/learner/assessments`}
                        className="inline-flex items-center gap-1 text-xs text-primary-container hover:underline font-label-caps font-bold"
                      >
                        TEST
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
