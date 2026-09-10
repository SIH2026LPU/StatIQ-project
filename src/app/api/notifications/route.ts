import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/auth/rbac";

export async function GET() {
  const session = await requireAuth();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  return ok(db.listNotifications(session.id));
}
