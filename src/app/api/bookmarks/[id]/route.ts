import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const { id } = await params;
  db.deleteBookmark(id);
  return ok({ deleted: id });
}
