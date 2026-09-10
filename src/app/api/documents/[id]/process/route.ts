import { db } from "@/db/store";
import { fail, ok } from "@/lib/api/http";
import { assertRole } from "@/lib/auth/rbac";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await assertRole(["TRAINER", "CONTENT_MANAGER", "ORG_ADMIN", "SUPER_ADMIN"]);
  if (gate.error) return gate.error;
  const { id } = await context.params;
  const doc = db.listDocuments().find((item) => item.id === id);
  if (!doc) return fail("RESOURCE_NOT_FOUND", "Document not found.", 404);
  const text = doc.excerpt || "";
  const parts = text.match(/.{1,400}/g) ?? [text];
  db.addChunks(
    parts.map((chunk, index) => ({
      id: `${id}-chk-${index}`,
      documentId: id,
      index,
      text: chunk,
    })),
  );
  doc.status = "indexed";
  return ok({ document: doc, chunks: parts.length });
}
