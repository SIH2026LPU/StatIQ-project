import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const body = await request.json();
  const courseId = String(body.courseId ?? "");
  const percent = Number(body.percent ?? 0);
  const moduleKey = String(body.moduleKey ?? "default");
  const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey) : undefined;
  if (!courseId) return fail("VALIDATION_ERROR", "courseId is required.", 422);
  const row = db.addProgress({
    id: `prg-${Date.now()}`,
    employeeId: session.employeeId,
    courseId,
    moduleKey,
    percent,
    timeSpentMinutes: Number(body.timeSpentMinutes ?? 0),
    completed: percent >= 100,
    idempotencyKey,
  });
  return ok(row);
}

export async function GET() {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  return ok(db.listProgress(session.employeeId));
}
