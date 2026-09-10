import { describe, expect, it } from "vitest";
import {
  gapPriority,
  nextAdaptiveDifficulty,
  proficiencyFromScore,
  roleReadiness,
  skillGap,
  updateCompetencyScore,
} from "@/lib/competency/engine";
import { analyzeGaps, recommendCourses } from "@/lib/recommendations/engine";

describe("competency engine", () => {
  it("maps scores to proficiency bands", () => {
    expect(proficiencyFromScore(12)).toBe("Beginner");
    expect(proficiencyFromScore(44)).toBe("Basic");
    expect(proficiencyFromScore(61)).toBe("Intermediate");
    expect(proficiencyFromScore(80)).toBe("Advanced");
    expect(proficiencyFromScore(90)).toBe("Expert");
  });

  it("computes non-negative gaps", () => {
    expect(skillGap(80, 55)).toBe(25);
    expect(skillGap(70, 90)).toBe(0);
  });

  it("weights gap priority", () => {
    const priority = gapPriority({
      gap: 40,
      roleWeight: 1,
      organizationalPriority: 1,
      careerRelevance: 1,
    });
    expect(priority).toBeCloseTo(0.4);
  });

  it("computes weighted role readiness", () => {
    const readiness = roleReadiness([
      { currentScore: 80, requiredScore: 80, weight: 1 },
      { currentScore: 40, requiredScore: 80, weight: 1 },
    ]);
    expect(readiness).toBeCloseTo(75);
  });

  it("updates competency with configurable evidence weight", () => {
    expect(
      updateCompetencyScore({
        oldScore: 60,
        assessmentScore: 80,
        assessmentWeight: 0.4,
      }),
    ).toBeCloseTo(68);
  });

  it("adapts question difficulty", () => {
    expect(nextAdaptiveDifficulty("medium", 2, 0)).toBe("hard");
    expect(nextAdaptiveDifficulty("medium", 0, 2)).toBe("easy");
  });
});

describe("recommendation engine", () => {
  it("ranks courses that cover critical gaps higher", () => {
    const gaps = analyzeGaps({
      competencies: [
        {
          id: "sql",
          categoryId: "tech",
          name: "SQL",
          description: "",
          measurementMethod: "assessment",
          defaultTargetLevel: 80,
        },
      ],
      employeeCompetencies: [
        {
          employeeId: "e1",
          competencyId: "sql",
          score: 40,
          targetLevel: 80,
          confidence: 0.7,
          lastAssessedAt: "2026-01-01",
          evidenceSource: "assessment",
        },
      ],
      roleCompetencies: [
        {
          roleId: "r1",
          competencyId: "sql",
          requiredScore: 80,
          weight: 1,
          organizationalPriority: 1,
        },
      ],
    });

    const recs = recommendCourses({
      courses: [
        {
          id: "sql-course",
          title: "SQL for Official Statistics",
          description: "",
          provider: "igot",
          durationHours: 12,
          difficulty: "medium",
          language: "en",
          deliveryMode: "online",
          qualityScore: 0.9,
          availability: "open",
        },
        {
          id: "gis-course",
          title: "GIS Basics",
          description: "",
          provider: "internal",
          durationHours: 8,
          difficulty: "easy",
          language: "en",
          deliveryMode: "online",
          qualityScore: 0.9,
          availability: "open",
        },
      ],
      courseCompetencies: [
        { courseId: "sql-course", competencyId: "sql", coverage: 0.9 },
        { courseId: "gis-course", competencyId: "gis", coverage: 0.9 },
      ],
      gaps,
      targetRoleId: "r1",
    });

    expect(recs[0]?.courseId).toBe("sql-course");
    expect(recs[0]?.explanation.gapIds).toContain("sql");
  });
});
