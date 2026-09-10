import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { assertRole, requireAuth } from "@/lib/auth/rbac";

export async function GET() {
  const session = await requireAuth();
  if (!session) return fail("UNAUTHENTICATED", "Sign in required.", 401);
  return ok(db.listDocuments());
}

export async function POST(request: Request) {
  const gate = await assertRole(["TRAINER", "CONTENT_MANAGER", "ORG_ADMIN", "SUPER_ADMIN"]);
  if (gate.error) return gate.error;
  const body = await request.json();
  const title = String(body.title ?? "");
  const excerpt = String(body.excerpt ?? body.text ?? "");
  const mimeType = String(body.mimeType ?? "text/plain");
  const allowed = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
  if (!allowed.includes(mimeType) && mimeType !== "text/plain") {
    return fail("VALIDATION_ERROR", "Unsupported MIME type.", 422);
  }
  if (excerpt.length > 200_000) return fail("VALIDATION_ERROR", "File text exceeds size limit.", 422);
  const id = `doc-${Date.now()}`;
  const doc = db.addDocument({
    id,
    title: title || "Uploaded material",
    mimeType,
    status: "uploaded",
    excerpt: excerpt.slice(0, 500),
    courseId: body.courseId,
  });
  return ok(doc, 201);
}
