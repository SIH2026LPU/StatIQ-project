import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";
import { learnerSnapshot } from "@/lib/services/intelligence";

export async function GET() {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const employee = db.getEmployee(session.employeeId);
  if (!employee) return fail("RESOURCE_NOT_FOUND", "Employee not found.", 404);
  const snap = learnerSnapshot(employee);
  return ok(snap.recommendations);
}

export async function POST() {
  const session = await requireAuth();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const employee = db.getEmployee(session.employeeId);
  if (!employee) return fail("RESOURCE_NOT_FOUND", "Employee not found.", 404);
  const snap = learnerSnapshot(employee);
  return ok(snap.recommendations);
}
