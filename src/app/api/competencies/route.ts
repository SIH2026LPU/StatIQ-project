import { db } from "@/db/store";
import { ok } from "@/lib/api/http";

export async function GET() {
  return ok({
    competencies: db.listCompetencies(),
    categories: db.listCategories(),
    provenance: "DEMO competency taxonomy seed — not MoSPI HR records.",
  });
}
