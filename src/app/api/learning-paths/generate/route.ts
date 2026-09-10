import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";
import { learnerSnapshot } from "@/lib/services/intelligence";

export async function POST() {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const employee = db.getEmployee(session.employeeId);
  if (!employee) return fail("RESOURCE_NOT_FOUND", "Employee not found.", 404);
  const snap = learnerSnapshot(employee);
  const courseIds = snap.recommendations.slice(0, 6).map((r) => r.courseId);
  const hours = snap.recommendations
    .slice(0, 6)
    .reduce((sum, rec) => sum + rec.explanation.effortHours, 0);
  const path = db.addLearningPath({
    id: `path-${Date.now()}`,
    employeeId: employee.id,
    targetRoleId: employee.targetRoleId,
    goal: employee.careerGoal,
    estimatedHours: hours,
    courseIds,
  });
  return ok({
    goal: employee.careerGoal,
    startingLevel: snap.overallScore,
    targetRole: snap.targetRole,
    orderedCourses: path.courseIds.map((id) => db.getCourse(id)),
    milestones: path.courseIds.map((id, index) => `Complete step ${index + 1}: ${db.getCourse(id)?.title}`),
    assessments: db.listAssessments(),
    estimatedDuration: hours,
    path,
  });
}

export async function GET() {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  return ok(db.listLearningPaths(session.employeeId));
}
