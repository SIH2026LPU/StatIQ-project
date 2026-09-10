import { redirect } from "next/navigation";
import { db } from "@/db/store";
import { getSession } from "@/lib/auth/session";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { LearnerSkillsView } from "@/components/learner/learner-skills-view";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/login");
  const employee = db.getEmployee(session.employeeId);

  const snap = learnerSnapshot(employee);

  // Find courses that address each gap
  const gapCourseMap: Record<string, Array<{ id: string; title: string }>> = {};
  for (const gap of snap.gaps) {
    const courses = db.listCourseCompetencies()
      .filter((cc) => cc.competencyId === gap.competencyId)
      .map((cc) => {
        const c = db.getCourse(cc.courseId);
        return c ? { id: c.id, title: c.title } : null;
      })
      .filter(Boolean) as Array<{ id: string; title: string }>;
    gapCourseMap[gap.competencyId] = courses;
  }

  return (
    <LearnerSkillsView
      gaps={snap.gaps.map((g) => ({
        competencyId: g.competencyId,
        competencyName: g.competencyName,
        currentScore: Math.round(g.currentScore),
        requiredScore: Math.round(g.requiredScore),
        gap: Math.max(0, Math.round(g.requiredScore - g.currentScore)),
        severity: (g.severity as "critical" | "moderate" | "strength") || "moderate",
      }))}
      categoryScores={snap.categoryScores.map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        score: c.score,
      }))}
      gapCourseMap={gapCourseMap}
    />
  );
}

