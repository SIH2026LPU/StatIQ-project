import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const notes = db.listNotes(session.employeeId);
  return ok({ notes });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const body = await request.json();
  const { courseId, moduleKey, timestampSeconds, content } = body;
  if (!courseId || !content?.trim()) return fail("INVALID_INPUT", "courseId and content are required.", 400);
  const now = new Date().toISOString();
  const note = db.addNote({
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: session.employeeId,
    courseId,
    moduleKey,
    timestampSeconds: timestampSeconds ?? undefined,
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
  });
  return ok({ note }, 201);
}
