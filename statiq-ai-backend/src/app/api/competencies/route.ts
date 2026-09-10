import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { employeeCompetencies, competencies, activities, activityCompetencies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const querySchema = z.object({
  employeeId: z.string().uuid().optional(),
});

/**
 * GET /api/competencies
 * Returns the competency passport for the given employee.
 */
export async function GET(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const targetEmployeeId = parsed.data.employeeId ?? (user?.employeeId ?? null);
  if (!targetEmployeeId) {
    return NextResponse.json({ error: "No employeeId available" }, { status: 400 });
  }

  const results = await db
    .select({
      competencyId: competencies.id,
      name: competencies.name,
      domain: competencies.domain,
      askType: competencies.askType,
      currentScore: employeeCompetencies.currentScore,
      trend: employeeCompetencies.trend,
      lastAssessedAt: employeeCompetencies.lastAssessedAt,
    })
    .from(employeeCompetencies)
    .innerJoin(competencies, eq(competencies.id, employeeCompetencies.competencyId))
    .where(eq(employeeCompetencies.employeeId, targetEmployeeId));

  return NextResponse.json({
    employeeId: targetEmployeeId,
    passport: results,
  });
}
