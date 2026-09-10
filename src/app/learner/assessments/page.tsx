import { db } from "@/db/store";
import { getSession } from "@/lib/auth/session";
import { Notice } from "@/components/app-shell";
import { LearnerAssessmentsView } from "@/components/learner/learner-assessments-view";

export const dynamic = "force-dynamic";

export default async function AssessmentsIndex() {
  const session = await getSession();
  const employee = session ? db.resolveEmployeeForSession(session) : null;
  const enrollments = employee ? db.listEnrollments(employee.id) : [];
  const allAssessments = db.listAssessments();

  // 1. Build list of assessments matching the learner's enrolled courses
  const enrolledAssessments: Array<{
    id: string;
    title: string;
    courseId?: string;
    courseTitle?: string;
    provider?: string;
    questionCount: number;
    adaptive: boolean;
    status: string;
    progressPercent: number;
  }> = [];

  for (const enr of enrollments) {
    const matchedAsm = allAssessments.find((a) => a.courseId === enr.courseId);
    const course = db.getCourse(enr.courseId);
    if (matchedAsm) {
      enrolledAssessments.push({
        id: matchedAsm.id,
        title: matchedAsm.title,
        courseId: enr.courseId,
        courseTitle: course?.title,
        provider: course?.provider,
        questionCount: matchedAsm.questionCount,
        adaptive: matchedAsm.adaptive,
        status: enr.status,
        progressPercent: enr.progressPercent,
      });
    } else if (course) {
      enrolledAssessments.push({
        id: `asm-${course.id}`,
        title: `${course.title} — Module Assessment`,
        courseId: course.id,
        courseTitle: course.title,
        provider: course.provider,
        questionCount: 5,
        adaptive: true,
        status: enr.status,
        progressPercent: enr.progressPercent,
      });
    }
  }

  // 2. All Benchmark Assessments
  const benchmarks = allAssessments.map((a) => {
    const course = a.courseId ? db.getCourse(a.courseId) : null;
    return {
      id: a.id,
      title: a.title,
      courseId: a.courseId,
      courseTitle: course?.title,
      provider: course?.provider,
      questionCount: a.questionCount,
      adaptive: a.adaptive,
    };
  });

  const competencies = db.listCompetencies().map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <Notice />
      <LearnerAssessmentsView
        enrolledAssessments={enrolledAssessments}
        assessments={benchmarks}
        competencies={competencies}
      />
    </div>
  );
}
