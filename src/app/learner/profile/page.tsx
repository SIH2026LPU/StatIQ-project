import { redirect } from "next/navigation";
import { db } from "@/db/store";
import { getSession } from "@/lib/auth/session";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { LearnerProfileView } from "@/components/learner/learner-profile-view";

export const dynamic = "force-dynamic";

export default async function LearnerProfilePage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");

  const employee = db.getEmployee(session.employeeId);
  const snap = learnerSnapshot(employee);

  return (
    <LearnerProfileView
      employee={{
        id: employee.id,
        name: employee.name,
        designation: employee.designation,
        careerGoal: employee.careerGoal,
      }}
      email={session?.email || ""}
      snap={{
        readiness: snap.readiness,
        department: snap.department ? { name: snap.department.name } : undefined,
        targetRole: snap.targetRole ? { name: snap.targetRole.name } : undefined,
        enrollments: snap.enrollments.map((e) => ({ learningHours: e.learningHours })),
        categoryScores: snap.categoryScores.map((c) => ({ name: c.name })),
      }}
    />
  );
}

