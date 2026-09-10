import { db } from "@/db/store";
import { TrainerQuizView } from "@/components/trainer/trainer-quiz-view";

export default function QuizPage() {
  const competencies = db.listCompetencies().map((c) => ({ id: c.id, name: c.name }));
  const drafts = db
    .listQuestions()
    .filter((q) => q.status === "review" || q.status === "draft")
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      status: q.status,
      difficulty: q.difficulty,
    }));

  return <TrainerQuizView competencies={competencies} drafts={drafts} />;
}
