import { redirect } from "next/navigation";
import { Notice } from "@/components/app-shell";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { CompetencyPassportView } from "@/components/profile/competency-passport-view";

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const employee = db.resolveEmployeeForSession(session);
  const snap = learnerSnapshot(employee);

  return (
    <div>
      <Notice />
      <CompetencyPassportView
        employee={{
          id: employee.id,
          name: employee.name,
          designation: employee.designation,
        }}
        snap={{
          readiness: snap.readiness,
          department: snap.department ? { name: snap.department.name } : undefined,
          targetRole: snap.targetRole ? { name: snap.targetRole.name } : undefined,
          passport: snap.passport.map(p => ({
            competencyId: p.competencyId,
            name: p.name,
            category: p.category,
            score: p.score,
          })),
          categoryScores: snap.categoryScores.map(c => ({
            categoryId: c.categoryId,
            name: c.name,
            score: c.score,
          })),
        }}
      />
    </div>
  );
}
