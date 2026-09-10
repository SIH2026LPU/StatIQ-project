import { workforceSnapshot } from "@/lib/services/intelligence";
import { AdminHeatmapView } from "@/components/admin/admin-heatmap-view";

export default function HeatmapPage() {
  const snap = workforceSnapshot();
  const names = snap.heatmap[0]?.competencies.map((c) => c.name) ?? [];

  return (
    <AdminHeatmapView
      heatmap={snap.heatmap.map((row) => ({
        department: {
          id: row.department.id,
          name: row.department.name,
          code: row.department.code,
        },
        competencies: row.competencies.map((c) => ({
          competencyId: c.competencyId,
          name: c.name,
          score: c.score,
        })),
      }))}
      competencyNames={names}
    />
  );
}
