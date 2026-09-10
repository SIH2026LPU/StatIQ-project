import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";
import { learnerSnapshot } from "@/lib/services/intelligence";

export async function GET() {
  const session = await requireAuth();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const employee = session.employeeId ? db.getEmployee(session.employeeId) : null;
  return ok({
    user: session,
    employee,
    snapshot: employee ? learnerSnapshot(employee) : null,
  });
}
