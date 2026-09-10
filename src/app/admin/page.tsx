import { workforceSnapshot } from "@/lib/services/intelligence";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export default function AdminHome() {
  const snap = workforceSnapshot();

  return (
    <AdminDashboardView
      totalLearners={snap.totalLearners}
      activeLearning={snap.activeLearning}
      competencyAverage={snap.competencyAverage}
      criticalGapCount={snap.criticalGapCount}
      completionRate={snap.completionRate}
      assessmentAverage={snap.assessmentAverage}
      emerging={snap.emerging.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        averageScore: e.averageScore,
        coverage: e.coverage,
      }))}
    />
  );
}
