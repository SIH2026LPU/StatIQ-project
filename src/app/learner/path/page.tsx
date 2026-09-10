import { redirect } from "next/navigation";
import { db } from "@/db/store";
import { getSession } from "@/lib/auth/session";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { LearnerPathView } from "@/components/learner/learner-path-view";

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
    <LearnerPathView
      careerGoal={employee.careerGoal}
      targetRoleName={snap.targetRole?.name}
      hours={hours}
      recommendations={snap.recommendations.map((r) => ({
        courseId: r.courseId,
        course: r.course ? {
          id: r.course.id,
          title: r.course.title,
          description: r.course.description,
          provider: r.course.provider,
        } : undefined,
        explanation: {
          why: r.explanation.why,
          effortHours: r.explanation.effortHours,
        },
      }))}
      programmes={snap.programmes.map((p) => ({
        id: p.id,
        provider: p.provider,
        title: p.title,
        description: p.description,
        durationDays: p.durationDays,
        targetDesignation: p.targetDesignation,
      }))}
    />
  );
}
