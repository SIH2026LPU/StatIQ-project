import { db } from "@/db";
import { employeeCompetencies, competencyScoreHistory } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const ALGORITHM_VERSION = "v1";

export interface UpdateCompetencyInput {
  employeeId: string;
  competencyId: string;
  assessmentScore: number; // 0-100, from an assessment attempt
  assessmentWeight?: number; // default 0.40 (design.md #16)
  evidenceType: "ASSESSMENT" | "CERTIFICATION" | "COURSE_COMPLETION" | "TRAINER_EVALUATION" | "SELF_ASSESSMENT" | "VERIFIED_WORK_EVIDENCE";
  evidenceRefId?: string;
}

/**
 * new_score = old_score x (1 - weight) + assessment_score x weight
 * Every update is written to competency_score_history for a full audit trail
 * (design.md #16, requirements.md FR-20).
 */
export async function updateCompetencyScore(input: UpdateCompetencyInput) {
  const { employeeId, competencyId, assessmentScore, evidenceType, evidenceRefId } = input;
  const weight = input.assessmentWeight ?? 0.4;

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(employeeCompetencies)
      .where(
        and(
          eq(employeeCompetencies.employeeId, employeeId),
          eq(employeeCompetencies.competencyId, competencyId)
        )
      )
      .for("update");

    const oldScore = existing?.currentScore ?? 0;
    const newScoreRaw = oldScore * (1 - weight) + assessmentScore * weight;
    const newScore = Math.round(Math.max(0, Math.min(100, newScoreRaw)));
    const trend = newScore > oldScore ? "IMPROVING" : newScore < oldScore ? "DECLINING" : "STABLE";

    let employeeCompetencyId: string;

    if (existing) {
      await tx
        .update(employeeCompetencies)
        .set({
          currentScore: newScore,
          trend,
          lastAssessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(employeeCompetencies.id, existing.id));
      employeeCompetencyId = existing.id;
    } else {
      const [created] = await tx
        .insert(employeeCompetencies)
        .values({
          employeeId,
          competencyId,
          currentScore: newScore,
          trend,
          lastAssessedAt: new Date(),
        })
        .returning();
      employeeCompetencyId = created.id;
    }

    await tx.insert(competencyScoreHistory).values({
      employeeCompetencyId,
      oldScore,
      newScore,
      evidenceType,
      evidenceRefId: evidenceRefId ?? null,
      assessmentWeight: String(weight),
      algorithmVersion: ALGORITHM_VERSION,
    });

    return { oldScore, newScore, trend };
  });
}
