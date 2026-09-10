import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const { id } = await params;
  const updated = db.markNotificationRead(id);
  if (!updated) return fail("RESOURCE_NOT_FOUND", "Notification not found.", 404);
  return ok({ notification: updated });
}
