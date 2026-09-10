import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeRoleReadiness } from "@/lib/competency/readiness-engine";
import { getSession } from "@/lib/auth/session";

const querySchema = z.object({
  employeeId: z.string().uuid().optional(),
  jobRoleId: z.string().uuid(),
});

/** GET /api/role-readiness?jobRoleId=...&employeeId=... — see FR-06 / design.md #10 */
export async function GET(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const targetEmployeeId = parsed.data.employeeId ?? (user?.employeeId ?? null);
  if (!targetEmployeeId) {
    return NextResponse.json({ error: "No employeeId available for this session" }, { status: 400 });
  }

  const result = await computeRoleReadiness(targetEmployeeId, parsed.data.jobRoleId);
  return NextResponse.json(result);
}
