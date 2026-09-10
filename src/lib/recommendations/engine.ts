import { gapPriority, skillGap } from "@/lib/competency/engine";
import type {
  Competency,
  Course,
  CourseCompetency,
  EmployeeCompetency,
  Recommendation,
  RoleCompetency,
} from "@/types/domain";

export interface GapItem {
  competencyId: string;
  competencyName: string;
  categoryId: string;
  currentScore: number;
  requiredScore: number;
  gap: number;
  priority: number;
  severity: "critical" | "moderate" | "strength";
  whyItMatters: string;
}

export function analyzeGaps(input: {
  competencies: Competency[];
  employeeCompetencies: EmployeeCompetency[];
  roleCompetencies: RoleCompetency[];
  careerRelevanceByCompetency?: Record<string, number>;
}): GapItem[] {
  const currentById = new Map(
    input.employeeCompetencies.map((item) => [item.competencyId, item]),
  );

  return input.roleCompetencies
    .map((roleComp) => {
      const competency = input.competencies.find(
        (item) => item.id === roleComp.competencyId,
      );
      const current = currentById.get(roleComp.competencyId)?.score ?? 0;
      const gap = skillGap(roleComp.requiredScore, current);
      const careerRelevance =
        input.careerRelevanceByCompetency?.[roleComp.competencyId] ?? 1;
      const priority = gapPriority({
        gap,
        roleWeight: roleComp.weight,
        organizationalPriority: roleComp.organizationalPriority,
        careerRelevance,
      });

      let severity: GapItem["severity"] = "strength";
      if (gap >= 25) severity = "critical";
      else if (gap >= 10) severity = "moderate";

      return {
        competencyId: roleComp.competencyId,
        competencyName: competency?.name ?? roleComp.competencyId,
        categoryId: competency?.categoryId ?? "",
        currentScore: current,
        requiredScore: roleComp.requiredScore,
        gap,
        priority,
        severity,
        whyItMatters:
          gap > 0
            ? `${competency?.name ?? "This competency"} is required at ${roleComp.requiredScore} for the target role; current evidence is ${Math.round(current)}.`
            : `${competency?.name ?? "This competency"} already meets the target-role requirement.`,
      };
    })
    .sort((a, b) => b.priority - a.priority);
}

export function recommendCourses(input: {
  courses: Course[];
  courseCompetencies: CourseCompetency[];
  gaps: GapItem[];
  targetRoleId: string;
  departmentPriorityByCompetency?: Record<string, number>;
  preferredLanguage?: string;
  completedCourseIds?: string[];
  /**
   * Map of internal courseId -> { batchId, sunbirdCourseId } for iGOT courses.
   * When present, the recommendation carries batchId so the enroll action can
   * call enrollCourse(userId, courseId, batchId) as the real Sunbird API requires.
   */
  igotBatchByCourseId?: Record<string, { batchId: string; sunbirdCourseId: string }>;
}): Recommendation[] {
  const gapByCompetency = new Map(input.gaps.map((gap) => [gap.competencyId, gap]));
  const completed = new Set(input.completedCourseIds ?? []);

  return input.courses
    .filter((course) => !completed.has(course.id) && course.availability !== "closed")
    .map((course) => {
      const mappings = input.courseCompetencies.filter(
        (item) => item.courseId === course.id,
      );
      const coveredGaps = mappings
        .map((mapping) => gapByCompetency.get(mapping.competencyId))
        .filter((item): item is GapItem => item != null && item.gap > 0);

      const gapCoverage =
        coveredGaps.length === 0
          ? 0
          : coveredGaps.reduce((sum, gap) => sum + (gap.gap / 100) * 1, 0) /
            Math.max(coveredGaps.length, 1);

      const roleRelevance =
        mappings.filter((mapping) => gapByCompetency.has(mapping.competencyId))
          .length / Math.max(mappings.length, 1);

      const courseQuality = course.qualityScore;
      const learningPreference =
        !input.preferredLanguage || course.language === input.preferredLanguage
          ? 1
          : 0.7;
      const departmentPriority =
        mappings.reduce((sum, mapping) => {
          return sum + (input.departmentPriorityByCompetency?.[mapping.competencyId] ?? 0.7);
        }, 0) / Math.max(mappings.length, 1);
      const accessibility = course.deliveryMode === "online" ? 1 : 0.7;

      const score =
        gapCoverage * 0.35 +
        roleRelevance * 0.25 +
        courseQuality * 0.1 +
        learningPreference * 0.1 +
        departmentPriority * 0.1 +
        accessibility * 0.1;

      const gapNames = coveredGaps.map((gap) => gap.competencyName);
      const why =
        gapNames.length > 0
          ? `Closes gaps in ${gapNames.slice(0, 3).join(", ")} for the selected target role.`
          : "Supports adjacent competencies and role progression, with lower direct gap coverage.";

      // Attach Sunbird batchId when available (required for real iGOT enrollment)
      const igotBatch = input.igotBatchByCourseId?.[course.id];

      return {
        courseId: course.id,
        ...(igotBatch
          ? { batchId: igotBatch.batchId, sunbirdCourseId: igotBatch.sunbirdCourseId }
          : {}),
        score,
        gapCoverage,
        roleRelevance,
        explanation: {
          why,
          gapIds: coveredGaps.map((gap) => gap.competencyId),
          targetRoleId: input.targetRoleId,
          effortHours: course.durationHours,
        },
      } satisfies Recommendation;
    })
    .sort((a, b) => b.score - a.score);
}
