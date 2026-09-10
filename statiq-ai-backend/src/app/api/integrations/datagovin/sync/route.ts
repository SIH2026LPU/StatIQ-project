import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { syncDataGovInResource } from "@/lib/integrations/datagovin/sync";
import { requireRole } from "@/lib/auth/session";

const bodySchema = z.object({
  resourceId: z.string().min(8, "resourceId looks too short to be a data.gov.in resource UUID"),
  maxRecords: z.number().int().positive().max(5000).optional(),
});

/**
 * POST /api/integrations/datagovin/sync
 * body: { "resourceId": "<data.gov.in resource UUID>", "maxRecords"?: 500 }
 *
 * Requires ORG_ADMIN or SUPER_ADMIN — this hits a live external API and writes
 * to the database, so it is not a read-only endpoint.
 */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["ORG_ADMIN", "SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await syncDataGovInResource(parsed.data.resourceId, {
    maxRecords: parsed.data.maxRecords,
  });

  const status = result.status === "SUCCESS" ? 200 : 502;
  return NextResponse.json(result, { status });
}
