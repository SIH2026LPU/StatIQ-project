import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/store";
import { getSession } from "@/lib/auth/session";
import { BACKEND_URL } from "@/lib/backend";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { SESSION_COOKIE } from "@/lib/auth/token";
import { LearnerDashboardView } from "@/components/learner/learner-dashboard-view";

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
    return (
      <LearnerDashboardView
        emp={{
          id: emp.id,
          name: emp.name,
          designation: emp.designation,
          department: emp.department,
          jobRoleId: emp.jobRoleId,
          jobRole: emp.jobRole,
          synthetic: emp.synthetic,
        }}
        gaps={fromApi.gaps}
        readiness={fromApi.readiness}
        unreadCount={2}
      />
    );
  }

  const employee = db.resolveEmployeeForSession(session);
  const snap = learnerSnapshot(employee);
  const unreadCount = db.countUnreadNotifications(session.id);

  return (
    <LearnerDashboardView
      emp={{
        id: employee.id,
        name: employee.name,
        designation: employee.designation,
        department: snap.department?.name || null,
        jobRoleId: employee.targetRoleId || null,
        jobRole: snap.targetRole?.name || null,
        synthetic: false,
        careerGoal: employee.careerGoal,
      }}
      gaps={snap.gaps.map((g) => ({
        competencyId: g.competencyId,
        competencyName: g.competencyName,
        currentScore: g.currentScore,
        requiredLevel: g.requiredScore,
        gap: g.gap,
        severity: g.severity,
      }))}
      readiness={snap.readiness}
      unreadCount={unreadCount}
      enrollments={snap.enrollments.map((e) => {
        const course = db.getCourse(e.courseId);
        return {
          id: e.id,
          courseId: e.courseId,
          status: e.status,
          learningHours: e.learningHours,
          course: course
            ? {
                id: course.id,
                title: course.title,
                provider: course.provider,
                durationHours: course.durationHours,
              }
            : undefined,
        };
      })}
      categoryScores={snap.categoryScores.map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        score: c.score,
      }))}
      recommendations={snap.recommendations.map((r) => ({
        courseId: r.courseId,
        course: r.course
          ? {
              id: r.course.id,
              title: r.course.title,
              provider: r.course.provider,
              durationHours: r.course.durationHours,
            }
          : undefined,
        explanation: { why: r.explanation.why },
      }))}
    />
  );
}
