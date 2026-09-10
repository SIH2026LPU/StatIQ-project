import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect } from "next/navigation";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { LearnerCommunityView } from "@/components/learner/learner-community-view";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const employee = db.getEmployee(session.employeeId);
  const snap = learnerSnapshot(employee);

  // Aggregate department stats — no individual identification
  const deptEmployees = db.listEmployees().filter((e) => e.departmentId === employee.departmentId);
  const deptEnrollments = deptEmployees.flatMap((e) => db.listEnrollments(e.id));
  const deptCompletions = deptEnrollments.filter((e) => e.status === "completed");

  // Course-level cohort stats (how many enrolled, completion rate)
  const courses = db.listCourses();
  const courseStats = courses.map((course) => {
    const enrolled = db.listEnrollments().filter((e) => e.courseId === course.id);
    const completed = enrolled.filter((e) => e.status === "completed");
    return {
      courseId: course.id,
      title: course.title,
      provider: course.provider,
      enrolledCount: enrolled.length,
      completedCount: completed.length,
      completionRate: enrolled.length > 0 ? Math.round((completed.length / enrolled.length) * 100) : 0,
    };
  }).filter((c) => c.enrolledCount > 0).sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 6);

  // Learner's own enrolled courses for discussion access
  const myEnrollments = snap.enrollments.map((e) => e.courseId);
  const department = db.getDepartment(employee.departmentId);

  const completionRate = deptEnrollments.length > 0 
    ? Math.round((deptCompletions.length / deptEnrollments.length) * 100) 
    : 0;

  return (
    <LearnerCommunityView
      departmentName={department?.name ?? "Statistical Division"}
      teamMembersCount={deptEmployees.length}
      totalEnrollmentsCount={deptEnrollments.length}
      completionsCount={deptCompletions.length}
      completionRate={completionRate}
      courseStats={courseStats}
      myEnrollments={myEnrollments}
      employeeId={employee.id}
      employeeName={employee.name}
    />
  );
}
