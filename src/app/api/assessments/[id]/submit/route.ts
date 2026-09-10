import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { recordAssessmentResult } from "@/lib/services/intelligence";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = await request.json();
  const result = recordAssessmentResult({
    employeeId: session.employeeId,
    assessmentId: id,
    answers: body.answers ?? [],
  });
  return NextResponse.json(result);
}
