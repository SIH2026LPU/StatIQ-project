import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const body = await request.json();
  const events = Array.isArray(body.events) ? body.events : [];
  const applied = [];
  for (const event of events) {
    const key = String(event.idempotencyKey ?? event.id ?? "");
    if (event.type === "progress" && session.employeeId) {
      applied.push(
        db.addProgress({
          id: key || `prg-${Date.now()}`,
          employeeId: session.employeeId,
          courseId: String(event.courseId),
          moduleKey: String(event.moduleKey ?? "offline"),
          percent: Number(event.percent ?? 0),
          timeSpentMinutes: Number(event.timeSpentMinutes ?? 0),
          completed: Boolean(event.completed),
          idempotencyKey: key || undefined,
        }),
      );
    }
  }
  return ok({ applied: applied.length });
}
