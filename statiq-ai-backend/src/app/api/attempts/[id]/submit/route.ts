import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessmentAttempts,
  assessmentAnswers,
  assessments,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { updateCompetencyScore } from "@/lib/competency/update-engine";

/**
 * POST /api/attempts/:id/submit
 * Scores the attempt from stored answers (never trusts a client-supplied score,
 * per design.md #17 PWA rule "never trust client-generated scores"), then feeds
 * the result into the competency update engine so role readiness reflects it
 * immediately.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(req);
  if (!user?.employeeId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const p = await params;
  const [attempt] = await db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.id, p.id));

  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  if (attempt.employeeId !== user.employeeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (attempt.status === "SUBMITTED") {
    return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });
  }

  const answers = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.attemptId, attempt.id));

  const correct = answers.filter((a) => a.isCorrect).length;
  const scorePercent = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;

  await db
    .update(assessmentAttempts)
    .set({ status: "SUBMITTED", scorePercent, submittedAt: new Date() })
    .where(eq(assessmentAttempts.id, attempt.id));

  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, attempt.assessmentId));

  let competencyUpdate = null;
  if (assessment?.competencyId) {
    competencyUpdate = await updateCompetencyScore({
      employeeId: user.employeeId ?? null,
      competencyId: assessment.competencyId,
      assessmentScore: scorePercent,
      evidenceType: "ASSESSMENT",
      evidenceRefId: attempt.id,
    });
  }

  return NextResponse.json({
    attemptId: attempt.id,
    scorePercent,
    passed: scorePercent >= (assessment?.passingScore ?? 60),
    competencyUpdate,
  });
}
