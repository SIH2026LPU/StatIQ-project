import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { redirect } from "next/navigation";
import { LearnerAchievementsView } from "@/components/learner/learner-achievements-view";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const employee = db.getEmployee(session.employeeId);
  const snap = learnerSnapshot(employee);
  const completedCourses = snap.enrollments.filter(e => e.status === "completed").map(e => ({
    id: e.id,
    completedAt: e.completedAt,
    course: db.getCourse(e.courseId)
  }));

  return (
    <LearnerAchievementsView
      employeeName={employee.name}
      completedCourses={completedCourses}
    />
  );
}
