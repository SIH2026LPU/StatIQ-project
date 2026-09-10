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
  const notes = db.listNotes(session.employeeId);
  if (!notes.find((n) => n.id === id)) return fail("RESOURCE_NOT_FOUND", "Note not found.", 404);
  db.deleteNote(id);
  return ok({ deleted: id });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const { id } = await params;
  const { content } = await request.json();
  if (!content?.trim()) return fail("INVALID_INPUT", "content is required.", 400);
  const updated = db.updateNote(id, content.trim());
  if (!updated) return fail("RESOURCE_NOT_FOUND", "Note not found.", 404);
  return ok({ note: updated });
}
