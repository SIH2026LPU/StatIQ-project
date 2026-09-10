import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/store";
import { Notice, Stat } from "@/components/app-shell";
import { EnrollButton } from "@/components/enroll-button";
import { getSession } from "@/lib/auth/session";
import { learnerSnapshot } from "@/lib/services/intelligence";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");
  const employee = db.getEmployee(session.employeeId);
  const snap = learnerSnapshot(employee);
  const dept = db.getDepartment(employee.departmentId);
  const role = db.getRole(employee.jobRoleId);
  const target = db.getRole(employee.targetRoleId);
  const critical = snap.gaps.filter((g) => g.severity === "critical");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Notice />
      <p className="kicker">Authenticated learner profile · DEMO personnel</p>
      <h1 className="mt-1 font-display text-4xl text-navy">{employee.name}</h1>
      <p className="mt-2 text-ink-soft">
        {employee.designation} · {dept?.name} · Current role: {role?.name} · Target role: {target?.name}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overall score" value={snap.overallScore.toFixed(0)} />
        <Stat label="Role readiness" value={`${snap.readiness.toFixed(0)}%`} />
        <Stat label="Critical gaps" value={String(critical.length)} />
        <Stat
          label="Learning hours"
          value={String(snap.enrollments.reduce((s, e) => s + e.learningHours, 0))}
        />
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-sm p-5">
          <h2 className="font-display text-2xl text-navy">Competencies & gaps</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {snap.gaps.slice(0, 8).map((gap) => (
              <li key={gap.competencyId} className="flex justify-between border-b border-line py-2">
                <span>{gap.competencyName}</span>
                <span>
                  {gap.currentScore.toFixed(0)} / {gap.requiredScore} (gap {gap.gap.toFixed(0)})
                </span>
              </li>
            ))}
          </ul>
        </article>
        <article className="surface rounded-sm p-5">
          <h2 className="font-display text-2xl text-navy">Recommendations</h2>
          <ul className="mt-3 space-y-3">
            {snap.recommendations.slice(0, 5).map((rec) => (
              <li key={rec.courseId}>
                <p className="font-medium">{rec.course?.title}</p>
                <p className="text-sm text-ink-soft">{rec.explanation.why}</p>
                <EnrollButton courseId={rec.courseId} />
              </li>
            ))}
          </ul>
          <Link href="/learner/path" className="mt-3 inline-block text-sm underline">
            Full path
          </Link>
        </article>
      </section>
    </div>
  );
}
