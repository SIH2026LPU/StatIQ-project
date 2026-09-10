import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRecommendations } from "@/lib/recommendation/engine";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { recommendations } from "@/db/schema";

const bodySchema = z.object({
  jobRoleId: z.string().uuid(),
  employeeId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

/**
 * POST /api/recommendations/generate
 * Runs the deterministic scoring engine (design.md #11) and persists the
 * results to `recommendations` so the learner dashboard can render them without
 * recomputing on every page load.
 */
export async function POST(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const targetEmployeeId = parsed.data.employeeId ?? (user?.employeeId ?? null);
  if (!targetEmployeeId) {
    return NextResponse.json({ error: "No employeeId available for this session" }, { status: 400 });
  }

  const scored = await generateRecommendations(targetEmployeeId, parsed.data.jobRoleId, {
    limit: parsed.data.limit,
  });

  if (scored.length > 0) {
    await db.insert(recommendations).values(
      scored.map((r) => ({
        employeeId: targetEmployeeId,
        courseId: r.courseId ?? null,
        competencyId: r.competencyId,
        score: String(r.score),
        scoreBreakdown: r.breakdown,
        explanation: r.explanation,
      }))
    );
  }

  return NextResponse.json({ employeeId: targetEmployeeId, recommendations: scored });
}
