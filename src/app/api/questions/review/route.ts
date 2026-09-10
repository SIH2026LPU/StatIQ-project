import { NextResponse } from "next/server";
import { db } from "@/db/store";
import { canAccess, getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !canAccess(session.role, "trainer")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const question = db.updateQuestionStatus(String(body.id), body.status);
  return NextResponse.json({ question });
}
