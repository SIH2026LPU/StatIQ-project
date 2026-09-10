import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const bookmarks = db.listBookmarks(session.employeeId);
  return ok({ bookmarks });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const body = await request.json();
  const { targetType, courseId, moduleKey, timestampSeconds, label } = body;
  if (!label?.trim()) return fail("INVALID_INPUT", "label is required.", 400);
  const bm = db.addBookmark({
    id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: session.employeeId,
    targetType: targetType ?? "LESSON",
    courseId,
    moduleKey,
    timestampSeconds,
    label: label.trim(),
    createdAt: new Date().toISOString(),
  });
  return ok({ bookmark: bm }, 201);
}
