import { analyzeGaps, recommendCourses } from "@/lib/recommendations/engine";
import type { Course, CourseCompetency, Competency, EmployeeCompetency, RoleCompetency } from "@/types/domain";
import { describe, expect, it } from "vitest";

describe("recommendation engine", () => {
  it("ranks courses that close larger competency gaps higher", () => {
    const competencies: Competency[] = [
        {
          id: "c1",
          name: "Sampling",
          categoryId: "cat",
          description: "",
          measurementMethod: "assessment",
          defaultTargetLevel: 80,
        },
    ];
    const employeeCompetencies: EmployeeCompetency[] = [
      {
        employeeId: "e1",
        competencyId: "c1",
        score: 40,
        targetLevel: 80,
        confidence: 0.8,
        lastAssessedAt: "2026-01-01",
        evidenceSource: "assessment",
      },
    ];
    const roleCompetencies: RoleCompetency[] = [
      {
        roleId: "r1",
        competencyId: "c1",
        requiredScore: 80,
        weight: 1,
        organizationalPriority: 1,
      },
    ];
    const gaps = analyzeGaps({ competencies, employeeCompetencies, roleCompetencies });
    const courses: Course[] = [
      {
        id: "low",
        title: "Other",
        description: "",
        provider: "internal",
        durationHours: 8,
        difficulty: "easy",
        language: "en",
        deliveryMode: "online",
        qualityScore: 0.5,
        availability: "open",
      },
      {
        id: "high",
        title: "Sampling design",
        description: "",
        provider: "nssta",
        durationHours: 16,
        difficulty: "medium",
        language: "en",
        deliveryMode: "online",
        qualityScore: 0.9,
        availability: "open",
      },
    ];
    const courseCompetencies: CourseCompetency[] = [
      { courseId: "high", competencyId: "c1", coverage: 1 },
    ];
    const recs = recommendCourses({
      courses,
      courseCompetencies,
      gaps,
      targetRoleId: "r1",
    });
    expect(recs[0]?.courseId).toBe("high");
    expect(recs[0]?.explanation.gapIds).toContain("c1");
  });
});
