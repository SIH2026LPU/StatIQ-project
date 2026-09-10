import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { TrainerDashboardView } from "@/components/trainer/trainer-dashboard-view";

export default function TrainerHome() {
  const learners = db.listEmployees().filter((e) => e.id !== "emp-ravi");
  const snaps = learners.map(learnerSnapshot);
  const weak = snaps.flatMap((s) =>
    s.gaps.filter((g) => g.severity === "critical").map((g) => ({
      name: s.employee.name,
      department: db.getDepartment(s.employee.departmentId)?.name || "Statistical Division",
      gap: g.competencyName,
      value: g.gap,
      currentScore: g.currentScore,
      targetScore: g.requiredScore,
    })),
  );
  const hours = db.listEnrollments().reduce((sum, e) => sum + e.learningHours, 0);
  const completed = db.listEnrollments().filter((e) => e.status === "completed").length;
  const total = db.listEnrollments().length;
  const avgReadiness =
    snaps.reduce((acc, s) => acc + s.readiness, 0) / (snaps.length || 1);

  return (
    <TrainerDashboardView
      learnersCount={learners.length}
      avgReadiness={avgReadiness}
      completed={completed}
      total={total}
      hours={hours}
      weak={weak}
    />
  );
}
