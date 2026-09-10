import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return fail("INVALID_INPUT", "courseId is required.", 400);
  const discussions = db.listDiscussions(courseId);
  return ok({ discussions });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.employeeId) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  const body = await request.json();
  const { courseId, content, parentId } = body;
  if (!courseId || !content?.trim()) return fail("INVALID_INPUT", "courseId and content are required.", 400);
  const employee = db.getEmployee(session.employeeId);
  const d = db.addDiscussion({
    id: `disc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    courseId,
    employeeId: session.employeeId,
    employeeName: employee?.name ?? session.name,
    parentId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  });
  return ok({ discussion: d }, 201);
}
