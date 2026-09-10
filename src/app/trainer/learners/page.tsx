import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { TrainerLearnersView } from "@/components/trainer/trainer-learners-view";

export default function TrainerLearners() {
  const learners = db.listEmployees();
  const snaps = learners.map(learnerSnapshot);
  const avgReadiness =
    snaps.reduce((acc, s) => acc + s.readiness, 0) / (snaps.length || 1);

  const learnerRows = learners.map((emp) => {
    const snap = learnerSnapshot(emp);
    const top = snap.gaps.find((g) => g.gap > 0);
    return {
      id: emp.id,
      name: emp.name,
      department: db.getDepartment(emp.departmentId)?.name || "Statistical Division",
      roleName: snap.currentRole?.name || "Statistical Officer",
      readiness: snap.readiness,
      topGap: top
        ? {
            competencyName: top.competencyName,
            gap: top.gap,
          }
        : undefined,
    };
  });

  return (
    <TrainerLearnersView
      learners={learnerRows}
      totalOfficers={learners.length}
      avgReadiness={avgReadiness}
      atRiskCount={snaps.filter((s) => s.readiness < 60).length}
    />
  );
}
