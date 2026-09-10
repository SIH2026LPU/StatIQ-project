import { TargetRoleForm } from "@/components/target-role-form";
import { redirect } from "next/navigation";
import { Notice } from "@/components/app-shell";
import { getSession } from "@/lib/auth/session";
import { Target, BrainCircuit, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { backendJson } from "@/lib/backend";
import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";

export default async function GapsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const employee = db.resolveEmployeeForSession(session);

  const data = await backendJson<any>(`/api/skill-gap?employeeId=${session.employeeId}&jobRoleId=${employee.targetRoleId}`).catch(() => null);

  let gaps = data?.gaps;
  let explanation = data?.explanation;

  if (!gaps || gaps.length === 0) {
    const snap = learnerSnapshot(employee);
    gaps = snap.gaps.map((g: any) => ({
      competencyId: g.competencyId,
      name: g.competencyName,
      domain: g.categoryName || "Official Statistics",
      currentScore: Math.round(g.currentScore),
      targetScore: Math.round(g.requiredScore),
      gap: Math.max(0, Math.round(g.requiredScore - g.currentScore)),
      priority: g.severity === "critical" ? 3 : g.severity === "moderate" ? 2 : 1,
    }));
    const topGaps = snap.gaps.filter((g: any) => g.severity === "critical").map((g: any) => g.competencyName);
    explanation = topGaps.length > 0 
      ? `To advance toward ${snap.targetRole?.name || "your target role"}, prioritize addressing key gaps in: ${topGaps.join(", ")}. Completing accredited MoSPI courses and adaptive benchmark tests will directly elevate your verified role readiness to ${Math.round(snap.readiness)}%+.`
      : `Your verified competency scores demonstrate strong alignment with ${snap.targetRole?.name || "your target role"}. Continue taking advanced microdata validations to maintain subject mastery.`;
  }
  
  const highPriority = gaps.filter((g: any) => g.gap > 0).sort((a: any, b: any) => b.priority - a.priority);
  const strengths = gaps.filter((g: any) => g.gap === 0);

  // Group by domain
  const byDomain = gaps.reduce((acc: Record<string, any[]>, gap: any) => {
    if (!acc[gap.domain]) acc[gap.domain] = [];
    acc[gap.domain].push(gap);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-up pb-24">
      <Notice />
      
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 font-label-caps text-label-caps text-primary">
          <Target className="w-3.5 h-3.5" />
          SKILL GAP ANALYSIS
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          Competency Profile
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          Understand the difference between your current competencies and the competencies required for your target role.
        </p>
      </header>

      {/* Target Role Selector & High-level Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden lg:col-span-1 border-t-[3px] border-t-primary">
          <div className="relative z-10 space-y-4">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">CURRENT ROLE</p>
              <p className="text-on-surface font-medium">{db.getRole(employee.jobRoleId)?.name || "Not Set"}</p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">TARGET ROLE</p>
              <TargetRoleForm
                currentId={employee.targetRoleId}
                roles={db.listRoles().slice(0, 8).map((r) => ({ id: r.id, name: r.name }))}
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col justify-center bg-gradient-to-br from-surface to-primary/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-2">AI Gap Explanation</h2>
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
            <h3 className="font-display text-lg font-bold">Priority Areas</h3>
          </div>
          {highPriority.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No significant gaps detected.</p>
          ) : (
            <ul className="space-y-4">
              {highPriority.slice(0, 4).map((g: any) => (
                <li key={g.competencyId} className="flex justify-between items-center text-sm">
                  <span className="text-on-surface font-medium truncate">{g.competencyName}</span>
                  <span className="text-error font-bold flex items-center gap-1">
                    -{g.gap} <span className="text-[10px] text-error/70 font-label-caps uppercase">gap</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 border-t-[3px] border-t-[#39ff14]">
          <div className="flex items-center gap-2 mb-6 text-[#39ff14]">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-display text-lg font-bold">Strengths</h3>
          </div>
          {strengths.length === 0 ? (
            <p className="text-on-surface-variant text-sm">Complete assessments to identify strengths.</p>
          ) : (
            <ul className="space-y-4">
              {strengths.slice(0, 4).map((g: any) => (
                <li key={g.competencyId} className="flex justify-between items-center text-sm">
                  <span className="text-on-surface font-medium truncate">{g.competencyName}</span>
                  <span className="text-[#39ff14] font-bold">Meeting Target</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="pt-4 space-y-8">
        <h2 className="font-display text-2xl font-bold text-on-surface">Detailed Competency Breakdown</h2>

        {Object.entries(byDomain as Record<string, any[]>).map(([domain, domainGaps]) => {
          const domainCurrentAvg = Math.round(domainGaps.reduce((acc, g) => acc + g.currentScore, 0) / domainGaps.length);
          const domainTargetAvg = Math.round(domainGaps.reduce((acc, g) => acc + g.requiredLevel, 0) / domainGaps.length);
          
          return (
          <div key={domain} className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-2">
              <h3 className="font-label-caps text-sm text-on-surface-variant uppercase tracking-widest">
                {domain.replace(/_/g, ' ')}
              </h3>
              <div className="flex gap-4 text-[11px] font-label-caps text-on-surface-variant">
                <span>Avg Current: <strong className="text-on-surface">{domainCurrentAvg}</strong></span>
                <span>Avg Target: <strong className="text-on-surface">{domainTargetAvg}</strong></span>
                <span>Gaps: <strong className="text-error">{domainGaps.filter(g => g.gap > 0).length}</strong></span>
              </div>
            </div>
            
            <div className="space-y-6">
              {domainGaps.map((g: any) => {
                const currentPct = Math.min(100, Math.max(0, g.currentScore));
                const targetPct = Math.min(100, Math.max(0, g.requiredLevel));
                const isGap = g.gap > 0;

                return (
                  <div key={g.competencyId} className="grid md:grid-cols-[1fr_200px] gap-4 items-center">
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-on-surface font-medium text-sm md:text-base">{g.competencyName}</span>
                        {isGap ? (
                          <span className="text-error text-[10px] font-label-caps uppercase tracking-wider px-2 py-0.5 rounded-full bg-error/10 border border-error/20">
                            Needs Improvement
                          </span>
                        ) : (
                          <span className="text-[#39ff14] text-[10px] font-label-caps uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#39ff14]/10 border border-[#39ff14]/20">
                            On Track
                          </span>
                        )}
                      </div>
                      
                      {/* Dual Bar Chart */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <div className="w-16 text-right text-[10px] font-label-caps text-on-surface-variant uppercase">Current</div>
                          <div className="flex-1 h-2 bg-surface/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isGap ? 'bg-primary' : 'bg-[#39ff14]'} rounded-full transition-all duration-1000`}
                              style={{ width: `${currentPct}%` }}
                            />
                          </div>
                          <div className="w-8 text-[11px] font-medium text-on-surface-variant text-right">{g.currentScore}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-16 text-right text-[10px] font-label-caps text-on-surface-variant uppercase">Target</div>
                          <div className="flex-1 h-2 bg-surface/50 rounded-full overflow-hidden relative border border-white/5">
                            <div 
                              className="h-full bg-on-surface-variant/40 rounded-full"
                              style={{ width: `${targetPct}%` }}
                            />
                            {/* Gap Highlight Overlay */}
                            {isGap && (
                              <div 
                                className="absolute top-0 bottom-0 bg-error/40 border-l border-error/50"
                                style={{ 
                                  left: `${currentPct}%`, 
                                  width: `${targetPct - currentPct}%` 
                                }}
                              />
                            )}
                          </div>
                          <div className="w-8 text-[11px] font-medium text-on-surface-variant text-right">{g.requiredLevel}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex justify-end pr-4">
                      {isGap ? (
                        <div className="text-right">
                          <span className="block text-xl font-display font-bold text-error">-{g.gap}</span>
                          <span className="text-[10px] font-label-caps uppercase text-error/70">Gap Points</span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="block text-xl font-display font-bold text-[#39ff14]">Ready</span>
                          <span className="text-[10px] font-label-caps uppercase text-[#39ff14]/70">No Gap</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )})}
      </div>
      
      {/* Methodology Section */}
      <div className="glass-panel rounded-2xl p-6 bg-surface/30">
        <h3 className="font-label-caps text-sm text-on-surface-variant uppercase tracking-widest mb-4">Methodology & Source</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-on-surface-variant">
          <div>
            <strong className="block text-on-surface mb-1">Current Competency</strong>
            Derived from your latest valid completed assessment.
          </div>
          <div>
            <strong className="block text-on-surface mb-1">Target Competency</strong>
            Based on the strict configured requirements for your target role.
          </div>
          <div>
            <strong className="block text-on-surface mb-1">Gap Calculation</strong>
            Deterministically computed as <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">max(Target - Current, 0)</code>.
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <a 
          href="/learner/path" 
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-on-primary font-label-caps font-bold tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <TrendingUp className="w-5 h-5" />
          Explore Learning Recommendations
        </a>
      </div>
    </div>
  );
}
