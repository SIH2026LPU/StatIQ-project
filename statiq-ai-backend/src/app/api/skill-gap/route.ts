import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeSkillGaps } from "@/lib/competency/gap-engine";
import { explainSkillGaps } from "@/lib/ai/skill-gap-explainer";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { employees, jobRoles } from "@/db/schema";
import { eq } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s: string) => UUID_RE.test(s);

const querySchema = z.object({
  employeeId: z.string().optional(),
  jobRoleId: z.string(),
});

export async function GET(req: NextRequest) {
  let user = await getSession(req);
  if (!user) {
    const targetEmp = req.nextUrl.searchParams.get("employeeId") || "emp-ananya";
    user = {
      userId: targetEmp,
      id: targetEmp,
      employeeId: targetEmp,
      role: "LEARNER",
      name: "Ananya Sharma",
      email: "learner@statiq.demo",
    };
  }

  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const targetEmployeeId = parsed.data.employeeId ?? (user?.employeeId ?? "emp-ananya");
  const { jobRoleId } = parsed.data;

  // Guard: non-UUID IDs come from the mock/local store — skip DB entirely and
  // return an empty gaps response so the frontend fallback logic can take over.
  if (!isUuid(jobRoleId) || !isUuid(targetEmployeeId)) {
    return NextResponse.json({
      employeeId: targetEmployeeId,
      jobRoleId,
      gaps: [],
      explanation: null,
    });
  }

  let currentRoleTitle = "Statistical Officer";
  let targetRoleTitle = "Data Analyst (Official Statistics)";

  try {
    const [employeeRecord] = await db
      .select({ currentRoleId: employees.jobRoleId })
      .from(employees)
      .where(eq(employees.id, targetEmployeeId));

    if (employeeRecord?.currentRoleId) {
      const [currentRole] = await db.select({ title: jobRoles.title }).from(jobRoles).where(eq(jobRoles.id, employeeRecord.currentRoleId));
      if (currentRole?.title) currentRoleTitle = currentRole.title;
    }

    const [targetRole] = await db.select({ title: jobRoles.title }).from(jobRoles).where(eq(jobRoles.id, jobRoleId));
    if (targetRole?.title) targetRoleTitle = targetRole.title;
  } catch {}

  const gaps = await computeSkillGaps(targetEmployeeId, jobRoleId);
  const explanation = await explainSkillGaps(currentRoleTitle, targetRoleTitle, gaps);

  return NextResponse.json({ 
    employeeId: targetEmployeeId, 
    jobRoleId, 
    gaps,
    explanation 
  });
}
