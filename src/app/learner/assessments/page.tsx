import { db } from "@/db/store";
import { Notice } from "@/components/app-shell";
import { LearnerAssessmentsView } from "@/components/learner/learner-assessments-view";

export const dynamic = "force-dynamic";

export default function AssessmentsIndex() {
  const assessments = db.listAssessments().map(a => ({
    id: a.id,
    title: a.title,
    questionCount: a.questionCount,
    adaptive: a.adaptive,
  }));
  const competencies = db.listCompetencies().map(c => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <Notice />
      <LearnerAssessmentsView assessments={assessments} competencies={competencies} />
    </div>
  );
}
