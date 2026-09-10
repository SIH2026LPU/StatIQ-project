import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";
import { learnerSnapshot, workforceSnapshot } from "@/lib/services/intelligence";

export async function GET() {
  const session = await requireAuth();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  if (session.role === "ORG_ADMIN" || session.role === "SUPER_ADMIN") {
    const snap = workforceSnapshot();
    return ok({
      kind: "admin",
      totalLearners: snap.totalLearners,
      competencyAverage: snap.competencyAverage,
      criticalGapCount: snap.criticalGapCount,
      completionRate: snap.completionRate,
      source: "application-store",
      synthetic: true,
    });
  }
  if (!session.employeeId) return fail("FORBIDDEN", "No employee profile.", 403);
  const employee = db.getEmployee(session.employeeId);
  if (!employee) return fail("RESOURCE_NOT_FOUND", "Employee not found.", 404);
  const snap = learnerSnapshot(employee);
  return ok({
    kind: "learner",
    competencyAverage: snap.overallScore,
    readiness: snap.readiness,
    learningHours: snap.enrollments.reduce((s, e) => s + e.learningHours, 0),
    criticalGaps: snap.gaps.filter((g) => g.severity === "critical").length,
    synthetic: true,
  });
}
