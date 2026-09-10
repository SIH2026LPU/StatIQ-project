import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";
import { getIGOTProvider } from "@/lib/integrations/igot";

export async function GET() {
  const session = await getSession();
  if (!session) return ok({ enrollments: [], enrolledCourseIds: [] });
  const employee = db.resolveEmployeeForSession(session);
  const enrollments = employee ? db.listEnrollments(employee.id) : [];
  return ok({
    enrollments,
    enrolledCourseIds: enrollments.map((e) => e.courseId),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const employee = db.resolveEmployeeForSession(session);
  const employeeId = employee?.id || session.employeeId || session.id;

  const body = await request.json();
  const courseId = String(body.courseId ?? "");
  const batchId: string | undefined = body.batchId ? String(body.batchId) : undefined;

  const course = db.getCourse(courseId);
  if (!course) return fail("RESOURCE_NOT_FOUND", "Course not found.", 404);

  // Check if already enrolled in memory store
  const existing = db.listEnrollments(employeeId).find((e) => e.courseId === course.id);
  if (existing) {
    return ok({
      enrollment: existing,
      course,
      alreadyEnrolled: true,
      ...(batchId ? { batchId } : {}),
    });
  }

  // For iGOT courses: call the Sunbird-shaped provider with courseId + batchId
  if (course.provider === "igot" && batchId) {
    try {
      const provider = getIGOTProvider();
      const sunbirdCourseId = course.externalId ?? courseId;
      await provider.enrollCourse(session.id, sunbirdCourseId, batchId);
    } catch {
      // Non-blocking fallback
    }
  }

  const enrollment = db.addEnrollment({
    id: `enr-${Date.now()}`,
    employeeId: employeeId,
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
    ...(batchId ? { batchId } : {}),
  });
}
