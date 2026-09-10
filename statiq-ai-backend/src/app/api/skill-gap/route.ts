import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeSkillGaps } from "@/lib/competency/gap-engine";
import { explainSkillGaps } from "@/lib/ai/skill-gap-explainer";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { employees, jobRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

const querySchema = z.object({
  employeeId: z.string().uuid().optional(),
  jobRoleId: z.string().uuid(),
});

/**
 * GET /api/skill-gap?jobRoleId=...&employeeId=...
 * employeeId defaults to the caller's own employee record. A LEARNER can only
 * ever see their own gaps; TRAINER/ORG_ADMIN can pass any employeeId in-org.
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
    return NextResponse.json({ error: "No employeeId available for this session" }, { status: 400 });
  }

  const isSelf = targetEmployeeId === (user?.employeeId ?? null);
  const isPrivileged = ["ORG_ADMIN", "SUPER_ADMIN", "TRAINER"].includes((user?.role ?? "LEARNER"));
  if (!isSelf && !isPrivileged) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [employeeRecord] = await db
    .select({ currentRoleId: employees.jobRoleId })
    .from(employees)
    .where(eq(employees.id, targetEmployeeId));

  if (!isSelf) {
    const [target] = await db
      .select({ organizationId: employees.organizationId })
      .from(employees)
      .where(eq(employees.id, targetEmployeeId));
    if (!target || target.organizationId !== (user?.organizationId ?? null)) {
      return NextResponse.json({ error: "Forbidden — outside your organization scope" }, { status: 403 });
    }
  }

  const [currentRole] = employeeRecord?.currentRoleId ? await db.select({ title: jobRoles.title }).from(jobRoles).where(eq(jobRoles.id, employeeRecord.currentRoleId)) : [{ title: "Unknown" }];
  const [targetRole] = await db.select({ title: jobRoles.title }).from(jobRoles).where(eq(jobRoles.id, parsed.data.jobRoleId));

  const gaps = await computeSkillGaps(targetEmployeeId, parsed.data.jobRoleId);
  
  // Only call AI Explanation if explicitly requested to save time and cost? The plan says it's returned alongside. Let's just return it.
  const explanation = await explainSkillGaps(currentRole?.title || "Unknown", targetRole?.title || "Unknown", gaps);

  return NextResponse.json({ 
    employeeId: targetEmployeeId, 
    jobRoleId: parsed.data.jobRoleId, 
    gaps,
    explanation 
  });
}
