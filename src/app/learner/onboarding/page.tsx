import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { redirect } from "next/navigation";
import { OnboardingClient } from "@/components/onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const employee = db.getEmployee(session.employeeId);

  // Skip logic: if already has target role AND at least one competency score → go to dashboard
  const existingScores = db.listEmployeeCompetencies(employee.id);
  if (employee.targetRoleId && existingScores.length > 0) {
    redirect("/learner");
  }

  const roles = db.listRoles();
  const competencies = db.listCompetencies();
  const categories = db.listCategories();

  return (
    <OnboardingClient
      employee={{
        id: employee.id,
        name: employee.name,
        designation: employee.designation,
        careerGoal: employee.careerGoal,
        preferredLanguage: employee.preferredLanguage,
        jobRoleId: employee.jobRoleId,
        targetRoleId: employee.targetRoleId,
      }}
      roles={roles}
      competencies={competencies}
      categories={categories}
    />
  );
}
