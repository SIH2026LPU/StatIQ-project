import { runCompleteAnalysis } from "@/lib/ai/groq-orchestrator";
import { ok, fail } from "@/lib/api/http";
import { assertRole } from "@/lib/auth/rbac";
import { db } from "@/db/store";
import { analyzeGaps } from "@/lib/competency/skill-gap";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = String(body.question ?? body.message ?? "").trim();
    const domain = String(body.domain ?? "official-statistics");
    const sessionId = body.sessionId ? String(body.sessionId) : undefined;

    if (!question) {
      return fail("BAD_REQUEST", "Please provide a question for the Statistical AI Analyst.", 400);
    }

    if (domain === "official-statistics") {
      const result = await runCompleteAnalysis(question, sessionId);
      return ok({
        result,
        ...result,
      });
    }

    // Workforce competency analysis domain (restricted to admins)
    const gate = await assertRole(["ORG_ADMIN", "SUPER_ADMIN"]);
    if (gate.error) return gate.error;

    const employees = db.listEmployees();
    const byDept = new Map<string, number[]>();
    for (const emp of employees) {
      const dept = db.getDepartment(emp.departmentId)?.code ?? "UNK";
      const sql = db.listEmployeeCompetencies(emp.id).find((c) => c.competencyId === "c-sql");
      const req =
        db.listRoleCompetencies(emp.targetRoleId).find((r) => r.competencyId === "c-sql")
          ?.requiredScore ?? 70;
      const gap = Math.max(req - (sql?.score ?? 0), 0);
      byDept.set(dept, [...(byDept.get(dept) ?? []), gap]);
    }
    const tableRows = [...byDept.entries()]
      .map(([dept, gaps]) => ({
        dept,
        avg_gap: Number((gaps.reduce((s, n) => s + n, 0) / gaps.length).toFixed(1)),
      }))
      .sort((a, b) => b.avg_gap - a.avg_gap)
      .slice(0, 8);

    const tally = new Map<string, number>();
    for (const emp of employees) {
      const gaps = analyzeGaps({
        competencies: db.listCompetencies(),
        employeeCompetencies: db.listEmployeeCompetencies(emp.id),
        roleCompetencies: db.listRoleCompetencies(emp.targetRoleId),
      });
      for (const g of gaps) {
        if (g.severity === "critical") {
          tally.set(g.competencyName, (tally.get(g.competencyName) ?? 0) + 1);
        }
      }
    }
    const topGap = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
    const explanation = question.toLowerCase().includes("sql")
      ? `${tableRows[0]?.dept ?? "N/A"} has the largest average SQL gap (${tableRows[0]?.avg_gap ?? 0}) in the employee competency store.`
      : topGap
        ? `Largest critical-gap volume is ${topGap[0]} (${topGap[1]} learner profiles). Numbers come from stored competency rows, not from a language model.`
        : "No critical gaps in store.";

    const adminResult = {
      success: true,
      answer: explanation,
      title: "Employee Workforce Competency Gap Analysis",
      dataset: {
        id: "workforce-competencies",
        name: "Employee Competency Metrics",
        source: "StatIQ Internal Workforce Store",
      },
      keyFindings: [
        {
          label: "Top Critical Competency Gap",
          value: topGap ? topGap[0] : "None",
          change: `${topGap ? topGap[1] : 0} Profiles Affected`,
          status: "down" as const,
        },
      ],
      table: {
        columns: ["Department", "Average SQL Gap (pts)"],
        rows: tableRows as any,
      },
      methodology: {
        operation: "workforce_skill_gap_analysis",
        dataset: "Employee Competency Metrics",
        metric: "competency_gap_score",
        recordsUsed: employees.length,
      },
      evidence: {
        source: "StatIQ Internal Workforce Store",
        dataset: "Employee Competency Metrics",
        datasetId: "workforce-competencies",
        retrievedAt: new Date().toISOString(),
        recordsUsed: employees.length,
        mode: "STORED" as const,
      },
      limitations: ["Based strictly on internal employee test and target role records."],
    };

    return ok({
      result: adminResult,
      ...adminResult,
    });
  } catch (err: any) {
    return fail("SERVER_ERROR", err.message || "An unexpected error occurred during statistical analysis.", 500);
  }
}
