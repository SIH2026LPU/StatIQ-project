import { NextResponse } from "next/server";
import { db } from "@/db/store";
import { generateMcqsWithAI, validateQuestion } from "@/lib/ai/quiz";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const topic = String(body.topic || "MoSPI National Statistics & Microdata Analysis");
    const competencyId = String(body.competencyId || "c-stat-methods");
    const difficulty = (body.difficulty === "easy" || body.difficulty === "hard") ? body.difficulty : "medium";
    const count = Number(body.count || 4);

    const documents = db.listDocuments();
    const excerpt = documents[0]?.excerpt || "Official statistical standards, sampling procedures, and index compilation guidelines.";

    const questions = await generateMcqsWithAI({
      topic,
      competencyId,
      difficulty,
      count,
      sourceExcerpt: excerpt,
    });

    const validated = questions.map((question: any) => ({
      ...question,
      validation: validateQuestion(question),
    }));

    // If user is a trainer or admin, persist to question bank
    if (session.role === "TRAINER" || session.role === "ORG_ADMIN" || session.role === "SUPER_ADMIN") {
      db.addQuestions(questions);
    }

    return NextResponse.json({ ok: true, questions: validated });
  } catch (error: any) {
    console.error("[GENERATE_QUIZ_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate AI MCQs", details: error.message }, { status: 500 });
  }
}

