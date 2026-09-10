import { db } from "@/db/store";
import { analyzeGaps } from "@/lib/recommendations/engine";
import { AdminRiskView } from "@/components/admin/admin-risk-view";

export default function RiskPage() {
  const employees = db.listEmployees();
  const risks = employees.flatMap((emp) => {
    const gaps = analyzeGaps({
      competencies: db.listCompetencies(),
      employeeCompetencies: db.listEmployeeCompetencies(emp.id),
      roleCompetencies: db.listRoleCompetencies(emp.targetRoleId),
    }).filter((g) => g.gap >= 20);
    return gaps.map((g) => ({
      employee: emp.name,
      department: db.getDepartment(emp.departmentId)?.name || "Statistical Division",
      departmentCode: db.getDepartment(emp.departmentId)?.code || "STAT",
      role: db.getRole(emp.targetRoleId)?.name || "Statistical Officer",
      ...g,
    }));
  });

  const highDeficit = risks.filter((r) => r.gap >= 35).length;
  const mediumDeficit = risks.filter((r) => r.gap < 35).length;

  return (
    <AdminRiskView
      risks={risks.map((r) => ({
        employee: r.employee,
        department: r.department,
        departmentCode: r.departmentCode,
        role: r.role,
        competencyId: r.competencyId,
        competencyName: r.competencyName,
        currentScore: r.currentScore,
        requiredScore: r.requiredScore,
        gap: r.gap,
      }))}
      highDeficit={highDeficit}
      mediumDeficit={mediumDeficit}
    />
  );
}
