import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/store";
import { Notice, Stat } from "@/components/app-shell";
import { EnrollButton } from "@/components/enroll-button";
import { getSession } from "@/lib/auth/session";
import { BACKEND_URL } from "@/lib/backend";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { SESSION_COOKIE } from "@/lib/auth/token";
import { getCourseThumbnail } from "@/lib/course-images";

export const dynamic = "force-dynamic";

type Gap = {
  competencyId: string;
  competencyName: string;
  currentScore: number;
  requiredLevel: number;
  gap: number;
  isCritical: boolean;
};

async function loadPostgresLearner(token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  const meRes = await fetch(`${BACKEND_URL}/api/me`, { headers, cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!meRes.ok) return null;
  const me = (await meRes.json()) as {
    employee: {
      id: string;
      name: string;
      designation: string | null;
      department: string | null;
      jobRoleId: string | null;
      jobRole: string | null;
      synthetic: boolean;
    } | null;
  };
  if (!me.employee?.id || !me.employee.jobRoleId) return { me, gaps: [] as Gap[], readiness: 0 };

  const q = `employeeId=${me.employee.id}&jobRoleId=${me.employee.jobRoleId}`;
  const [gapsRes, readyRes] = await Promise.all([
    fetch(`${BACKEND_URL}/api/skill-gap?${q}`, { headers, cache: "no-store" }),
    fetch(`${BACKEND_URL}/api/role-readiness?${q}`, { headers, cache: "no-store" }),
  ]);
  const gapsJson = gapsRes.ok ? await gapsRes.json() : { gaps: [] };
  const readyJson = readyRes.ok ? await readyRes.json() : { overallReadiness: 0 };
  return {
    me,
    gaps: (gapsJson.gaps ?? []) as Gap[],
    readiness: Number(readyJson.overallReadiness ?? 0),
  };
}

export default async function LearnerHome() {
  const session = await getSession();
  if (!session) redirect("/login");

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const fromApi = token ? await loadPostgresLearner(token).catch(() => null) : null;

  if (fromApi?.me.employee) {
    const emp = fromApi.me.employee;
    const critical = fromApi.gaps.filter((g) => g.isCritical || g.gap >= 25);
    return (
      <div className="space-y-8 animate-fade-up">
        {/* Cohort Banner */}
        <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
              🔥
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Your cohort is active!</p>
              <p className="text-xs text-on-surface-variant">Your department completed 12 courses this week. Keep up the momentum.</p>
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
            COMPETENCY PASSPORT · POSTGRESQL BACKEND · {emp.synthetic ? "DEMO DATA" : "LIVE"}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight flex items-center gap-4">
            {emp.name}
            <Link href="/learner/notifications" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              <span>2 new</span>
            </Link>
          </h1>
          <p className="max-w-2xl text-on-surface-variant text-lg">
            {emp.designation} · {emp.department} <br/>
            <span className="text-on-surface font-medium mt-1 inline-block">Target Role: {emp.jobRole}</span>
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Role readiness" value={`${fromApi.readiness.toFixed(0)}%`} hint={emp.jobRole ?? ""} />
          <Stat label="Skill gaps" value={String(fromApi.gaps.filter((g) => g.gap > 0).length)} />
          <Stat label="Critical gaps" value={String(critical.length)} />
          <Stat label="Competencies scored" value={String(fromApi.gaps.length)} />
        </div>

        <article className="glass-panel rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-2xl text-on-surface font-bold tracking-tight">Gaps vs Target Role</h2>
          <p className="text-on-surface-variant text-sm mt-1 mb-6">Competencies where you fall short of the required proficiency level.</p>
          
          <ul className="space-y-1">
            {fromApi.gaps.map((gap) => (
              <li key={gap.competencyId} className="flex justify-between items-center border-b border-white/5 py-4 last:border-0 hover:bg-white/5 px-4 -mx-4 rounded-xl transition-colors group">
                <span className="text-sm font-medium text-on-surface group-hover:text-primary-container transition-colors">{gap.competencyName}</span>
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
            <Link href="/learner/path" className="glow-button-secondary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-label-caps font-bold tracking-widest">
              VIEW LEARNING PATH
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    );
  }

  const employee = db.resolveEmployeeForSession(session);
  const snap = learnerSnapshot(employee);
  const critical = snap.gaps.filter((g) => g.severity === "critical");
  const unreadCount = db.countUnreadNotifications(session.id);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Cohort Banner */}
      <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
            🔥
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Your cohort is active!</p>
            <p className="text-xs text-on-surface-variant">Your department completed 12 courses this week. Keep up the momentum.</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-lg font-display font-bold text-primary-container">3 Day</p>
          <p className="text-[10px] font-label-caps text-on-surface-variant">LEARNING STREAK</p>
        </div>
      </div>

      <Notice />
      
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-fixed-dim">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
          COMPETENCY PASSPORT · IN-MEMORY DEMO (BACKEND OFFLINE)
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight flex items-center gap-4">
          {employee.name}
          {unreadCount > 0 && (
            <Link href="/learner/notifications" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              <span>{unreadCount} new</span>
            </Link>
          )}
        </h1>
        <p className="max-w-2xl text-on-surface-variant text-lg">
          {employee.designation} · {snap.department?.name} <br/>
          <span className="text-on-surface font-medium mt-1 inline-block">Target Role: {snap.targetRole?.name}</span>
          <span className="block text-sm mt-2 opacity-80">{employee.careerGoal}</span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overall score" value={snap.overallScore.toFixed(0)} hint="Mean of evidenced competencies" />
        <Stat label="Role readiness" value={`${snap.readiness.toFixed(0)}%`} hint={snap.targetRole?.name} />
        <Stat label="Critical gaps" value={String(critical.length)} hint="Required minus current ≥ 25" />
        <Stat
          label="Learning hours"
          value={String(snap.enrollments.reduce((s, e) => s + e.learningHours, 0))}
          hint={`${snap.enrollments.length} enrolments`}
        />
      </div>

      {/* Continue Learning Section */}
      {snap.enrollments.filter(e => e.status === "enrolled").length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-on-surface">Continue Learning</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snap.enrollments.filter(e => e.status === "enrolled").slice(0, 3).map((enrollment) => {
              const course = db.getCourse(enrollment.courseId);
              if (!course) return null;
              
              // Fake progress between 10% and 80% based on course id length
              const progress = Math.min(80, Math.max(10, course.id.length * 5));
              
              return (
                <div key={enrollment.id} className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-primary-container/30 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img src={getCourseThumbnail(course.title)} alt="" className="w-full h-full object-cover opacity-80" />
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
                      <span className="text-on-surface-variant">{progress}% Complete</span>
                      <span className="text-on-surface-variant">{course.durationHours} hrs total</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden mb-4">
                      <div className="h-full bg-primary-container rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <Link href={`/learner/courses/${course.id}/play`} className="glow-button w-full py-2 rounded-full font-label-caps tracking-widest text-[10px] font-bold block text-center mt-2">
                      RESUME COURSE
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="glass-panel rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-2xl text-on-surface font-bold tracking-tight">Category Scores</h2>
          <p className="text-on-surface-variant text-sm mt-1 mb-6">Your current proficiency aggregated by major domains.</p>
          
          <ul className="space-y-5">
            {snap.categoryScores.map((cat) => (
              <li key={cat.categoryId} className="group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-on-surface group-hover:text-primary-container transition-colors">{cat.name}</span>
                  <span className="font-label-caps text-on-surface-variant">{cat.score ? cat.score.toFixed(0) : "—"}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-container-high border border-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary-container/80 to-primary-container transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(cat.score, 100)}%` }} 
                  />
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel rounded-2xl p-6 md:p-8 border-t-[3px] border-t-secondary-container flex flex-col">
          <h2 className="font-display text-2xl text-on-surface font-bold tracking-tight">Recommended Learning</h2>
          <p className="text-on-surface-variant text-sm mt-1 mb-6">Courses dynamically selected to close your specific skill gaps.</p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mt-4">
            {snap.recommendations.slice(0, 4).map((rec) => (
              <li key={rec.courseId} className="group glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 hover:border-primary-container/30 transition-colors">
                {/* Thumbnail */}
                <Link href={`/learner/courses/${rec.courseId}`} className="block h-32 relative overflow-hidden bg-surface-container-high shrink-0">
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

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <Link href={`/learner/courses/${rec.courseId}`}>
                    <h3 className="font-bold text-on-surface text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary-container transition-colors">
                      {rec.course?.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-4 flex-1">
                    {rec.explanation.why}
                  </p>
                  
                  {/* Footer / Action */}
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
          
          <div className="mt-6 pt-4 border-t border-white/5">
            <Link href="/learner/path" className="glow-button-secondary w-full inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-full text-xs font-label-caps font-bold tracking-widest">
              VIEW FULL LEARNING PATH
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
