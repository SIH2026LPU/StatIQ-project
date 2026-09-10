import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const { id } = await context.params;
  const assessment = db.getAssessment(id);
  if (!assessment) return fail("RESOURCE_NOT_FOUND", "Assessment not found.", 404);
  const questionIds = db
    .listQuestions(id)
    .filter((q) => q.status === "published")
    .map((q) => q.id);
  const attempt = db.addAttempt({
    id: `att-${Date.now()}`,
    assessmentId: id,
    employeeId: session.employeeId,
    score: 0,
    startedAt: new Date().toISOString(),
    submittedAt: "",
  });
  return ok({ attemptId: attempt.id, questionIds, adaptive: assessment.adaptive });
}
