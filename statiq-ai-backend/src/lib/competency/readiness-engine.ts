import { db } from "@/db";
import { employeeCompetencies, roleCompetencies, competencies } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface RoleReadinessResult {
  overallReadiness: number; // 0-100
  strongCompetencies: { competencyId: string; name: string; coverage: number }[];
  missingCompetencies: { competencyId: string; name: string; coverage: number }[];
  criticalGaps: { competencyId: string; name: string; currentScore: number; requiredLevel: number }[];
}

/**
 * coverage = min(current_score / required_score, 1)
 * weighted_coverage = coverage x competency_weight
 * readiness = sum(weighted_coverage) / sum(competency_weight) x 100
 * (design.md #10, requirements.md FR-06)
 */
export async function computeRoleReadiness(
  employeeId: string,
  jobRoleId: string
): Promise<RoleReadinessResult> {
  const requirements = await db
    .select({
      competencyId: roleCompetencies.competencyId,
      name: competencies.name,
      requiredLevel: roleCompetencies.requiredLevel,
      weight: roleCompetencies.weight,
      isCritical: roleCompetencies.isCritical,
    })
    .from(roleCompetencies)
    .innerJoin(competencies, eq(competencies.id, roleCompetencies.competencyId))
    .where(eq(roleCompetencies.jobRoleId, jobRoleId));

  const currentScores = await db
    .select({
      competencyId: employeeCompetencies.competencyId,
      currentScore: employeeCompetencies.currentScore,
    })
    .from(employeeCompetencies)
    .where(eq(employeeCompetencies.employeeId, employeeId));

  const scoreMap = new Map(currentScores.map((s) => [s.competencyId, s.currentScore]));

  let weightedCoverageSum = 0;
  let weightSum = 0;
  const strong: RoleReadinessResult["strongCompetencies"] = [];
  const missing: RoleReadinessResult["missingCompetencies"] = [];
  const critical: RoleReadinessResult["criticalGaps"] = [];

  for (const req of requirements) {
    const currentScore = scoreMap.get(req.competencyId) ?? 0;
    const coverage = Math.min(currentScore / req.requiredLevel, 1);
    const weight = Number(req.weight);

    weightedCoverageSum += coverage * weight;
    weightSum += weight;

    if (coverage >= 0.85) {
      strong.push({ competencyId: req.competencyId, name: req.name, coverage });
    } else {
      missing.push({ competencyId: req.competencyId, name: req.name, coverage });
    }

    if (req.isCritical === 1 && coverage < 1) {
      critical.push({
        competencyId: req.competencyId,
        name: req.name,
        currentScore,
        requiredLevel: req.requiredLevel,
      });
    }
  }

  const overallReadiness = weightSum > 0 ? (weightedCoverageSum / weightSum) * 100 : 0;

  return {
    overallReadiness: Math.round(overallReadiness * 100) / 100,
    strongCompetencies: strong.sort((a, b) => b.coverage - a.coverage),
    missingCompetencies: missing.sort((a, b) => a.coverage - b.coverage),
    criticalGaps: critical,
  };
}
