import { notFound } from "next/navigation";
import { db } from "@/db/store";
import { QuizRunner } from "@/components/quiz-runner";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = db.getAssessment(id);
  if (!assessment) notFound();
  const questions = db
    .listQuestions(assessment.id)
    .filter((q) => q.status === "published")
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      difficulty: q.difficulty,
    }));

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/10 font-label-caps text-label-caps text-secondary-fixed-dim">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
          ADAPTIVE CHECK
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
          {assessment.title}
        </h1>
      </header>
      
      <div className="glass-panel rounded-3xl p-6 md:p-10 border-t-[3px] border-t-primary-container">
        <QuizRunner assessmentId={assessment.id} questions={questions} />
      </div>
    </div>
  );
}
