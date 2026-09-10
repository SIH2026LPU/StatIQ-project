import { redirect } from "next/navigation";
import { db } from "@/db/store";
import { EnrollButton } from "@/components/enroll-button";
import { Notice } from "@/components/app-shell";
import { getSession } from "@/lib/auth/session";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { Map, Clock, ArrowRight } from "lucide-react";

export default async function PathPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const employee = db.resolveEmployeeForSession(session);
  const snap = learnerSnapshot(employee);
  const hours = snap.recommendations.slice(0, 5).reduce(
    (sum, rec) => sum + rec.explanation.effortHours,
    0,
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <Notice />
      
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-fixed-dim">
          <Map className="w-4 h-4 text-secondary-fixed-dim" />
          RECOMMENDED CURRICULUM
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          Personalised Learning Path
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          Goal: <strong className="text-on-surface font-medium">{employee.careerGoal}</strong>
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-lg border border-white/5">
          <Clock className="w-4 h-4 text-primary-container" />
          Fastest route uses gap coverage, role relevance and effort. Estimated <strong>{hours} hours</strong> for the first five steps.
        </div>
      </header>

      <ol className="mt-8 space-y-4">
        {snap.recommendations.slice(0, 6).map((rec, index) => (
          <li key={rec.courseId} className="glass-panel glass-panel-interactive rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start group">
            <div className="w-12 h-12 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center font-display text-xl font-bold text-on-surface-variant group-hover:text-primary-container group-hover:border-primary-container/30 transition-colors shrink-0">
              {String(index + 1).padStart(2, "0")}
            </div>
            
            <div className="flex-1 space-y-3">
              <h2 className="font-display text-2xl text-on-surface font-bold leading-tight group-hover:text-primary-container transition-colors">
                {rec.course?.title}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-3xl">
                {rec.course?.description}
              </p>
              
              <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2 mt-4">
                <p className="text-sm font-medium text-on-surface">Why this was recommended</p>
                <p className="text-sm text-on-surface-variant">{rec.explanation.why}</p>
                
                <div className="flex flex-wrap items-center gap-2 pt-2">
                   <span className="px-2 py-1 bg-surface-container border border-white/5 rounded text-[10px] font-label-caps uppercase text-on-surface-variant">
                     Target: {snap.targetRole?.name}
                   </span>
                   <span className="px-2 py-1 bg-surface-container border border-white/5 rounded text-[10px] font-label-caps uppercase text-on-surface-variant">
                     Effort: {rec.explanation.effortHours}h
                   </span>
                   <span className="px-2 py-1 bg-primary-container/10 border border-primary-container/20 text-primary-container rounded text-[10px] font-label-caps uppercase">
                     Provider: {rec.course?.provider}
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
          NSSTA / TPAC Programmes
          <ArrowRight className="w-5 h-5 text-on-surface-variant" />
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {snap.programmes.map((p) => (
            <li key={p.id} className="glass-panel glass-panel-interactive rounded-2xl p-6 flex flex-col h-full">
              <div className="inline-block px-2 py-1 rounded bg-secondary-container/10 text-secondary-fixed-dim font-label-caps text-[10px] uppercase border border-secondary-container/20 w-max mb-3">
                {p.provider}
              </div>
              <p className="font-bold text-on-surface text-lg leading-tight mb-2">{p.title}</p>
              <p className="text-sm text-on-surface-variant mb-4 flex-1">{p.description}</p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant/80 border-t border-white/5 pt-4">
                <span>{p.durationDays} days</span>
                <span>{p.targetDesignation}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
