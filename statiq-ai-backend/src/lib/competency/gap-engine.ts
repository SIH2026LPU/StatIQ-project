import { db } from "@/db";
import { employeeCompetencies, roleCompetencies, jobRoles, competencies } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface SkillGap {
  competencyId: string;
  competencyName: string;
  domain: string;
  currentScore: number;
  requiredLevel: number;
  gap: number; // max(required - current, 0)
  organizationalPriority: number;
  careerRelevance: number;
  roleWeight: number;
  isRequired: boolean;
  priority: number; // gap x roleWeight x orgPriority x careerRelevance
}

export interface GapAnalysisOptions {
  organizationalPriority?: number; // 0-1, from department/org priority config; default neutral
  careerRelevance?: number; // 0-1, from employee's stated career goal match; default neutral
}

/**
 * Computes skill gaps for one employee against one target job role.
 * gap = max(required_level - current_score, 0)
 * priority = normalized_gap x role_weight x organizational_priority x career_relevance
 */
export async function computeSkillGaps(
  employeeId: string,
  jobRoleId: string,
  options: GapAnalysisOptions = {}
): Promise<SkillGap[]> {
  const { organizationalPriority = 1.0, careerRelevance = 1.0 } = options;

  const requirements = await db
    .select({
      competencyId: roleCompetencies.competencyId,
      competencyName: competencies.name,
      domain: competencies.domain,
      requiredLevel: roleCompetencies.requiredLevel,
      weight: roleCompetencies.weight,
      isCritical: roleCompetencies.isCritical,
    })
    .from(roleCompetencies)
    .innerJoin(competencies, eq(competencies.id, roleCompetencies.competencyId))
    .where(eq(roleCompetencies.jobRoleId, jobRoleId));

  if (requirements.length === 0) return [];

  const currentScores = await db
    .select({
      competencyId: employeeCompetencies.competencyId,
      currentScore: employeeCompetencies.currentScore,
    })
    .from(employeeCompetencies)
    .where(eq(employeeCompetencies.employeeId, employeeId));

  const scoreMap = new Map(currentScores.map((s) => [s.competencyId, s.currentScore]));

  const rawGaps = requirements.map((req) => {
    const currentScore = scoreMap.get(req.competencyId) ?? 0;
    const gap = Math.max(req.requiredLevel - currentScore, 0);
    return { req, currentScore, gap };
  });

  const maxGap = Math.max(...rawGaps.map((g) => g.gap), 1); // avoid divide-by-zero

  const results: SkillGap[] = rawGaps.map(({ req, currentScore, gap }) => {
    const normalizedGap = gap / maxGap; // 0-1
    const roleWeight = Number(req.weight) || 1.0;
    const priority = normalizedGap * roleWeight * organizationalPriority * careerRelevance;

    return {
      competencyId: req.competencyId,
      competencyName: req.competencyName,
      domain: req.domain,
      currentScore,
      requiredLevel: req.requiredLevel,
      gap,
      organizationalPriority,
      careerRelevance,
      roleWeight,
      isRequired: req.isCritical === 1,
      priority,
    };
  });

  return results.sort((a, b) => b.priority - a.priority);
}
