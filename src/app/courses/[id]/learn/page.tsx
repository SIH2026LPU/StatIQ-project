import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect, notFound } from "next/navigation";
import { LMSPlayerClient } from "@/components/lms-player-client";

export const dynamic = "force-dynamic";

/** Generate synthetic modules from a course — real module data would come from a module table */
function buildModules(courseId: string, durationHours: number, difficulty: string) {
  const totalMins = durationHours * 60;
  const types = difficulty === "easy"
    ? ["VIDEO", "READING", "QUIZ"]
    : difficulty === "hard"
    ? ["VIDEO", "READING", "VIDEO", "INTERACTIVE", "QUIZ", "CODING_EXERCISE", "ASSIGNMENT"]
    : ["VIDEO", "READING", "VIDEO", "QUIZ", "CODING_EXERCISE"];
  
  return types.map((type, i) => ({
    id: `mod-${courseId}-${i}`,
    courseId,
    orderIndex: i,
    title: type === "VIDEO"
      ? i === 0 ? "Introduction & Overview" : `Concept Deep Dive ${Math.ceil(i / 2)}`
      : type === "READING"
      ? "Study Materials & References"
      : type === "QUIZ"
      ? "Knowledge Check"
      : type === "CODING_EXERCISE"
      ? "Hands-on Practice"
      : type === "INTERACTIVE"
      ? "Interactive Exercise"
      : "Final Assignment",
    moduleType: type,
    durationMinutes: Math.round(totalMins / types.length),
    requiredForCompletion: type !== "READING",
  }));
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const { id: courseId } = await params;
  const course = db.getCourse(courseId);
  if (!course) notFound();

  const employee = db.getEmployee(session.employeeId);

  // Check enrollment
  const enrollment = db.listEnrollments(session.employeeId).find((e) => e.courseId === courseId);

  const modules = buildModules(courseId, course.durationHours, course.difficulty);
  const moduleProgress = db.listModuleProgress(session.employeeId, courseId);
  const notes = db.listNotes(session.employeeId).filter((n) => n.courseId === courseId);

  return (
    <LMSPlayerClient
      course={course}
      modules={modules}
      moduleProgress={moduleProgress}
      notes={notes}
      enrollment={enrollment ?? null}
      learnerName={employee.name}
    />
  );
}
