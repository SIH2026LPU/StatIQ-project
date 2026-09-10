import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";
import { learnerSnapshot } from "@/lib/services/intelligence";

export async function GET() {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Learner profile required.", 401);
  const employee = db.getEmployee(session.employeeId);
  if (!employee) return fail("RESOURCE_NOT_FOUND", "Employee not found.", 404);
  return ok({
    profile: employee,
    competencies: db.listEmployeeCompetencies(employee.id),
    enrollments: db.listEnrollments(employee.id),
    assessments: db.listAttempts(employee.id),
    snapshot: learnerSnapshot(employee),
  });
}

export async function PATCH(request: Request) {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Learner profile required.", 401);
  const body = await request.json();
  const updated = db.updateEmployee(session.employeeId, {
    careerGoal: body.careerGoal,
    targetRoleId: body.targetRoleId,
    preferredLanguage: body.preferredLanguage,
  });
  if (!updated) return fail("RESOURCE_NOT_FOUND", "Employee not found.", 404);
  db.addAudit({
    id: `aud-${Date.now()}`,
    userId: session.id,
    action: "update_profile",
    resource: "employee",
    resourceId: updated.id,
  });
  return ok({ profile: updated, snapshot: learnerSnapshot(updated) });
}
