import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/db";
import { departments, employees, jobRoles } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ user, postgres: false });
  }

  const db = getDb();
  const isUuid = (value?: string) =>
    Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

  let employee = isUuid(user.employeeId)
    ? (await db.select().from(employees).where(eq(employees.id, user.employeeId!)).limit(1))[0]
    : undefined;
  if (!employee && isUuid(user.id)) {
    employee = (await db.select().from(employees).where(eq(employees.userId, user.id)).limit(1))[0];
  }
  if (!employee) {
    return NextResponse.json({ user, employee: null });
  }
  const dept = employee?.departmentId
    ? (await db.select().from(departments).where(eq(departments.id, employee.departmentId)).limit(1))[0]
    : null;
  const role = employee?.jobRoleId
    ? (await db.select().from(jobRoles).where(eq(jobRoles.id, employee.jobRoleId)).limit(1))[0]
    : null;

  return NextResponse.json({
    user,
    employee: employee
      ? {
          id: employee.id,
          name: employee.fullName,
          designation: employee.designation,
          department: dept?.name,
          jobRoleId: employee.jobRoleId,
          jobRole: role?.title,
          synthetic: employee.isSynthetic,
        }
      : null,
  });
}
