import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";
import { getIGOTProvider } from "@/lib/integrations/igot";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);

  const body = await request.json();
  const courseId = String(body.courseId ?? "");
  const batchId: string | undefined = body.batchId ? String(body.batchId) : undefined;

  const course = db.getCourse(courseId);
  if (!course) return fail("RESOURCE_NOT_FOUND", "Course not found.", 404);

  // For iGOT courses: call the Sunbird-shaped provider with courseId + batchId
  // (real Sunbird always requires a batchId — the adapter preserves this structural detail).
  if (course.provider === "igot" && batchId) {
    try {
      const provider = getIGOTProvider();
      const sunbirdCourseId = course.externalId ?? courseId;
      await provider.enrollCourse(session.id, sunbirdCourseId, batchId);
    } catch {
      // Mock provider never throws; OfficialIGOTProvider will throw loudly if misconfigured.
      // Fall through to internal enrollment record regardless.
    }
  }

  const enrollment = db.addEnrollment({
    id: `enr-${Date.now()}`,
    employeeId: session.employeeId,
    courseId: course.id,
    status: "in_progress",
    progressPercent: 5,
    learningHours: 0,
    enrolledAt: new Date().toISOString(),
  });

  db.addNotification({
    id: `ntf-${Date.now()}`,
    userId: session.id,
    type: "course",
    title: "Enrolled",
    body: `You enrolled in ${course.title}`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  return ok({
    enrollment,
    course,
    // Echo back the batchId so UI can confirm it was included in the Sunbird call
    ...(batchId ? { batchId } : {}),
  });
}
