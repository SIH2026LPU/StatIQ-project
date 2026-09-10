import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect, notFound } from "next/navigation";
import { LmsLabClient } from "@/components/lms-lab-client";

export const dynamic = "force-dynamic";

export default async function LabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const { id: courseId } = await params;
  const course = db.getCourse(courseId);
  if (!course) notFound();

  const executions = db.listLabExecutions(session.employeeId)
    .filter((e) => e.courseId === courseId)
    .slice(-10); // last 10 executions for history

  return (
    <LmsLabClient
      course={{ id: course.id, title: course.title, provider: course.provider }}
      history={executions}
    />
  );
}
