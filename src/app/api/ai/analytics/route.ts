import { NextResponse } from "next/server";
import { db } from "@/db/store";
import { canAccess, getSession } from "@/lib/auth/session";
import { analyzeGaps } from "@/lib/recommendations/engine";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !canAccess(session.role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const question = String(body.question ?? "").toLowerCase();

  const employees = db.listEmployees();
  const byDept = new Map<string, number[]>();

  for (const emp of employees) {
    const dept = db.getDepartment(emp.departmentId)?.code ?? "UNK";
    const sql = db
      .listEmployeeCompetencies(emp.id)
      .find((c) => c.competencyId === "c-sql");
    const req =
      db
        .listRoleCompetencies(emp.targetRoleId)
        .find((r) => r.competencyId === "c-sql")?.requiredScore ?? 70;
    const gap = Math.max(req - (sql?.score ?? 0), 0);
    byDept.set(dept, [...(byDept.get(dept) ?? []), gap]);
  }

  const deptAvg = [...byDept.entries()].map(([dept, gaps]) => ({
    dept,
    avg: gaps.reduce((s, n) => s + n, 0) / gaps.length,
  }));
  deptAvg.sort((a, b) => b.avg - a.avg);

  const improved = db
    .listEmployeeCompetencies()
    .filter((c) => c.previousScore != null && c.score > (c.previousScore ?? 0));

  let answer =
    "Ask about SQL gaps, competency improvement, or training priority. Answers use aggregate demo data only.";

  if (question.includes("sql") && question.includes("gap")) {
    const top = deptAvg[0];
    answer = top
      ? `${top.dept} currently shows the largest average SQL gap (${top.avg.toFixed(0)} points) among synthetic departmental averages.`
      : "No SQL gap data.";
  } else if (question.includes("improved")) {
    answer = `${improved.length} competency records in this session show an increase after assessment evidence (old score retained on the record).`;
  } else if (question.includes("priorit")) {
    const gaps = employees.flatMap((emp) =>
      analyzeGaps({
        competencies: db.listCompetencies(),
        employeeCompetencies: db.listEmployeeCompetencies(emp.id),
        roleCompetencies: db.listRoleCompetencies(emp.targetRoleId),
      }),
    );
    const tally = new Map<string, number>();
    for (const g of gaps) {
      if (g.severity === "critical") {
        tally.set(g.competencyName, (tally.get(g.competencyName) ?? 0) + 1);
      }
    }
    const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
    answer = top
      ? `Prioritise training for ${top[0]} — it appears as a critical gap for ${top[1]} synthetic learner profiles.`
      : "No critical gaps in the current demo slice.";
  }

  return NextResponse.json({ answer });
}
