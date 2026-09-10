import { db } from "@/db/store";
import {
  overallCompetencyScore,
  proficiencyFromScore,
  roleReadiness,
  updateCompetencyScore,
} from "@/lib/competency/engine";
import { analyzeGaps, recommendCourses } from "@/lib/recommendations/engine";
import type { Employee } from "@/types/domain";

export function learnerSnapshot(employee: Employee) {
  const competencies = db.listCompetencies();
  const categories = db.listCategories();
  const current = db.listEmployeeCompetencies(employee.id);
  const targetRole = db.getRole(employee.targetRoleId);
  const currentRole = db.getRole(employee.jobRoleId);
  const department = db.getDepartment(employee.departmentId);
  const roleReqs = db.listRoleCompetencies(employee.targetRoleId);
  const gaps = analyzeGaps({
    competencies,
    employeeCompetencies: current,
    roleCompetencies: roleReqs,
  });
  const enrollments = db.listEnrollments(employee.id);
  const recs = recommendCourses({
    courses: db.listCourses(),
    courseCompetencies: db.listCourseCompetencies(),
    gaps,
    targetRoleId: employee.targetRoleId,
    preferredLanguage: employee.preferredLanguage,
    completedCourseIds: enrollments
      .filter((item) => item.status === "completed")
      .map((item) => item.courseId),
  }).slice(0, 8);
  db.saveRecommendations(employee.id, recs);

  const readinessItems = roleReqs.map((req) => ({
    currentScore:
      current.find((item) => item.competencyId === req.competencyId)?.score ?? 0,
    requiredScore: req.requiredScore,
    weight: req.weight,
  }));

  const passport = current.map((item) => {
    const competency = db.getCompetency(item.competencyId);
    const category = categories.find((cat) => cat.id === competency?.categoryId);
    return {
      ...item,
      name: competency?.name ?? item.competencyId,
      category: category?.name ?? "Other",
      level: proficiencyFromScore(item.score),
    };
  });

  const categoryScores = categories.map((category) => {
    const items = passport.filter((item) => {
      const competency = db.getCompetency(item.competencyId);
      return competency?.categoryId === category.id;
    });
    return {
      categoryId: category.id,
      name: category.name,
      score: overallCompetencyScore(items.map((item) => item.score)),
      count: items.length,
    };
  });

  return {
    employee,
    department,
    currentRole,
    targetRole,
    overallScore: overallCompetencyScore(current.map((item) => item.score)),
    readiness: roleReadiness(readinessItems),
    passport,
    categoryScores,
    gaps,
    recommendations: recs.map((rec) => ({
      ...rec,
      course: db.getCourse(rec.courseId),
    })),
    enrollments: enrollments.map((item) => ({
      ...item,
      course: db.getCourse(item.courseId),
    })),
    programmes: db.listProgrammes(),
  };
}

export function recordAssessmentResult(input: {
  employeeId: string;
  assessmentId: string;
  answers: Array<{ questionId: string; selectedIndex: number }>;
}) {
  const assessment = db.getAssessment(input.assessmentId);
  if (!assessment) throw new Error("Assessment not found");
  const questions = db.listQuestions(assessment.id).filter((q) => q.status === "published");
  let correct = 0;
  const review = input.answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    const isCorrect = question ? question.correctIndex === answer.selectedIndex : false;
    if (isCorrect) correct += 1;
    return {
      ...answer,
      correctIndex: question?.correctIndex ?? -1,
      isCorrect,
      explanation: question?.explanation ?? "",
      prompt: question?.prompt ?? "",
      options: question?.options ?? [],
    };
  });

  const assessmentScore = questions.length
    ? (correct / questions.length) * 100
    : 0;

  const existing = db
    .listEmployeeCompetencies(input.employeeId)
    .find((item) => item.competencyId === assessment.competencyId);

  const oldScore = existing?.score ?? 40;
  const newScore = updateCompetencyScore({
    oldScore,
    assessmentScore,
    assessmentWeight: 0.4,
  });

  db.upsertEmployeeCompetency({
    employeeId: input.employeeId,
    competencyId: assessment.competencyId,
    score: newScore,
    targetLevel: existing?.targetLevel ?? 70,
    confidence: 0.8,
    lastAssessedAt: new Date().toISOString(),
    evidenceSource: "assessment",
    previousScore: oldScore,
  });

  db.addAttempt({
    id: `att-${Date.now()}`,
    assessmentId: assessment.id,
    employeeId: input.employeeId,
    score: assessmentScore,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  });

  const employee = db.getEmployee(input.employeeId);
  const after = employee ? learnerSnapshot(employee) : null;

  return {
    assessmentScore,
    correct,
    total: questions.length,
    oldScore,
    newScore,
    competencyId: assessment.competencyId,
    review,
    readiness: after?.readiness ?? 0,
  };
}

export function workforceSnapshot() {
  const employees = db.listEmployees();
  const snapshots = employees.map((employee) => learnerSnapshot(employee));
  const competencies = db.listCompetencies();
  const departments = db.listDepartments();

  const avg =
    snapshots.reduce((sum, item) => sum + item.overallScore, 0) /
    Math.max(snapshots.length, 1);

  const criticalGaps = snapshots.flatMap((item) =>
    item.gaps.filter((gap) => gap.severity === "critical"),
  );

  const heatmap = departments.map((dept) => {
    const deptSnaps = snapshots.filter(
      (item) => item.employee.departmentId === dept.id,
    );
    const byCompetency = competencies.slice(0, 12).map((competency) => {
      const scores = deptSnaps.map((snap) => {
        return (
          snap.passport.find((item) => item.competencyId === competency.id)
            ?.score ?? 0
        );
      });
      const score =
        scores.length === 0
          ? 0
          : scores.reduce((sum, value) => sum + value, 0) / scores.length;
      return { competencyId: competency.id, name: competency.name, score };
    });
    return { department: dept, competencies: byCompetency };
  });

  const emerging = competencies.filter((item) => item.emerging).map((item) => {
    const scores = snapshots
      .map(
        (snap) =>
          snap.passport.find((row) => row.competencyId === item.id)?.score,
      )
      .filter((value): value is number => typeof value === "number");
    const current =
      scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1);
    return {
      ...item,
      averageScore: current,
      coverage: scores.length / Math.max(snapshots.length, 1),
    };
  });

  const completions = db
    .listEnrollments()
    .filter((item) => item.status === "completed").length;
  const totalEnroll = db.listEnrollments().length;

  return {
    totalLearners: employees.length,
    activeLearning: db
      .listEnrollments()
      .filter((item) => item.status === "in_progress").length,
    competencyAverage: avg,
    criticalGapCount: criticalGaps.length,
    completionRate: totalEnroll ? completions / totalEnroll : 0,
    assessmentAverage:
      db.listAttempts().reduce((sum, item) => sum + item.score, 0) /
      Math.max(db.listAttempts().length, 1),
    heatmap,
    emerging,
    snapshots,
    departments,
    competencies,
  };
}
