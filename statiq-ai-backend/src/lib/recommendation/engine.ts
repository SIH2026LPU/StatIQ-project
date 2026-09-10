import { db } from "@/db";
import { courses, courseCompetencies, competencies, enrollments } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { computeSkillGaps, type SkillGap } from "@/lib/competency/gap-engine";
import { getMockProgrammes } from "@/lib/integrations/nssta/mock-provider";

export interface ScoredRecommendation {
  courseId?: string;
  programmeId?: string;
  title: string;
  competencyId: string;
  competencyName: string;
  score: number; // 0-1
  learningBucket: string;
  breakdown: {
    gapCoverage: number;
    roleRelevance: number;
    courseQuality: number;
    learningPreference: number;
    departmentPriority: number;
    accessibility: number;
  };
  explanation: string;
}

const WEIGHTS = {
  gapCoverage: 0.35,
  roleRelevance: 0.25,
  courseQuality: 0.1,
  learningPreference: 0.1,
  departmentPriority: 0.1,
  accessibility: 0.1,
} as const;

/**
 * recommendation_score =
 *   gap_coverage x 0.35 + role_relevance x 0.25 + course_quality x 0.10
 *   + learning_preference x 0.10 + department_priority x 0.10 + accessibility x 0.10
 * (design.md #11, requirements.md FR-08)
 *
 * MVP: deterministic scoring over the internal course catalogue + the NSSTA/TPAC
 * mock catalogue. Swap `courseQuality`/`learningPreference` inputs for a learned
 * ranking model later without touching the gap-coverage math.
 */
export async function generateRecommendations(
  employeeId: string,
  jobRoleId: string,
  opts: { preferredLanguage?: string; limit?: number } = {}
): Promise<ScoredRecommendation[]> {
  const { preferredLanguage = "en", limit = 10 } = opts;

  const gaps = await computeSkillGaps(employeeId, jobRoleId);
  const topGaps = gaps.filter((g) => g.gap > 0).slice(0, 8);
  if (topGaps.length === 0) return [];

  const gapCompetencyIds = topGaps.map((g) => g.competencyId);

  const alreadyEnrolled = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.employeeId, employeeId));
  const enrolledCourseIds = new Set(alreadyEnrolled.map((e) => e.courseId));

  const candidateCourses = await db
    .select({
      courseId: courses.id,
      title: courses.title,
      language: courses.language,
      qualityScore: courses.qualityScore,
      isAvailable: courses.isAvailable,
      learningBucket: courses.learningBucket,
      competencyId: courseCompetencies.competencyId,
      coverageWeight: courseCompetencies.coverageWeight,
    })
    .from(courseCompetencies)
    .innerJoin(courses, eq(courses.id, courseCompetencies.courseId))
    .where(
      and(inArray(courseCompetencies.competencyId, gapCompetencyIds), eq(courses.isAvailable, true))
    );

  const gapByCompetency = new Map<string, SkillGap>(topGaps.map((g) => [g.competencyId, g]));
  const results: ScoredRecommendation[] = [];

  for (const c of candidateCourses) {
    if (enrolledCourseIds.has(c.courseId)) continue;
    const gapInfo = gapByCompetency.get(c.competencyId);
    if (!gapInfo) continue;

    const gapCoverage = Number(c.coverageWeight) * (gapInfo.gap / 100);
    const roleRelevance = gapInfo.careerRelevance;
    const courseQuality = Number(c.qualityScore ?? 0.7);
    const learningPreference = c.language === preferredLanguage ? 1 : 0.5;
    const departmentPriority = gapInfo.organizationalPriority;
    const accessibility = c.isAvailable ? 1 : 0;

    const score =
      gapCoverage * WEIGHTS.gapCoverage +
      roleRelevance * WEIGHTS.roleRelevance +
      courseQuality * WEIGHTS.courseQuality +
      learningPreference * WEIGHTS.learningPreference +
      departmentPriority * WEIGHTS.departmentPriority +
      accessibility * WEIGHTS.accessibility;

    results.push({
      courseId: c.courseId,
      title: c.title,
      competencyId: c.competencyId,
      competencyName: gapInfo.competencyName,
      score: Math.round(score * 10000) / 10000,
      learningBucket: c.learningBucket ?? "DIGITAL_70",
      breakdown: {
        gapCoverage,
        roleRelevance,
        courseQuality,
        learningPreference,
        departmentPriority,
        accessibility,
      },
      explanation: buildExplanation(c.title, gapInfo),
    });
  }

  // Also rank NSSTA/TPAC mock programmes for the same gaps (FR-08, FR-11)
  const programmes = await getMockProgrammes();
  for (const programme of programmes) {
    const matchedGap = topGaps.find((g) =>
      programme.competencyTags.some((t) => t.toLowerCase() === g.competencyName.toLowerCase())
    );
    if (!matchedGap) continue;

    const gapCoverage = matchedGap.gap / 100;
    const roleRelevance = matchedGap.careerRelevance;
    const courseQuality = 0.75; // NSSTA/TPAC programmes are curated; static prior until reviewed
    const learningPreference = 0.7; // in-person, language-neutral assumption
    const departmentPriority = matchedGap.organizationalPriority;
    const accessibility = 0.6; // requires travel/seat availability, lower than self-paced iGOT course

    const score =
      gapCoverage * WEIGHTS.gapCoverage +
      roleRelevance * WEIGHTS.roleRelevance +
      courseQuality * WEIGHTS.courseQuality +
      learningPreference * WEIGHTS.learningPreference +
      departmentPriority * WEIGHTS.departmentPriority +
      accessibility * WEIGHTS.accessibility;

    results.push({
      title: `${programme.title} (${programme.source})`,
      competencyId: matchedGap.competencyId,
      competencyName: matchedGap.competencyName,
      score: Math.round(score * 10000) / 10000,
      learningBucket: "CLASSROOM_10", // NSSTA programmes default to classroom
      breakdown: {
        gapCoverage,
        roleRelevance,
        courseQuality,
        learningPreference,
        departmentPriority,
        accessibility,
      },
      explanation: buildExplanation(`${programme.title} (${programme.source})`, matchedGap),
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildExplanation(title: string, gap: SkillGap): string {
  return (
    `Recommended because your ${gap.competencyName} score is ${gap.currentScore}/100 ` +
    `against a role requirement of ${gap.requiredLevel}/100 (gap of ${gap.gap} points). ` +
    `"${title}" directly builds this competency.`
  );
}
