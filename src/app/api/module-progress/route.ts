import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";

/**
 * POST /api/module-progress
 * Saves video/module progress. Called on pause, seek, end — NOT per animation frame.
 * Body: { courseId, moduleKey, videoPositionSeconds, watchedSeconds, status? }
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const body = await request.json();
  const { courseId, moduleKey, videoPositionSeconds, watchedSeconds, status } = body;
  if (!courseId || !moduleKey) return fail("INVALID_INPUT", "courseId and moduleKey are required.", 400);

  const now = new Date().toISOString();
  const existing = db.getModuleProgress(session.employeeId, courseId, moduleKey);
  const isCompleted = status === "COMPLETED" || (watchedSeconds && watchedSeconds > 0 && watchedSeconds >= (existing?.watchedSeconds ?? 0) * 0.9);

  const record = db.upsertModuleProgress({
    id: existing?.id ?? `mp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: session.employeeId,
    courseId,
    moduleKey,
    status: status ?? (isCompleted ? "COMPLETED" : "IN_PROGRESS"),
    videoPositionSeconds: videoPositionSeconds ?? existing?.videoPositionSeconds ?? 0,
    watchedSeconds: Math.max(watchedSeconds ?? 0, existing?.watchedSeconds ?? 0),
    lastOpenedAt: now,
    completedAt: isCompleted && !existing?.completedAt ? now : existing?.completedAt,
  });

  // If module completed, add a real notification
  if (record.status === "COMPLETED" && !existing?.completedAt) {
    const course = db.getCourse(courseId);
    if (session.id) {
      db.addNotification({
        id: `ntf-mp-${Date.now()}`,
        userId: session.id,
        type: "progress",
        title: "Module Completed",
        body: `You completed a module in "${course?.title ?? courseId}".`,
        read: false,
        createdAt: now,
      });
    }
  }

  return ok({ moduleProgress: record });
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId") ?? undefined;
  const progress = db.listModuleProgress(session.employeeId, courseId);
  return ok({ progress });
}
