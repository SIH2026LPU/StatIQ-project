import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { sessions } from "@/db/schema";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("statiq_session")?.value;
  if (token) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.token, token)).execute();
  }

  const response = NextResponse.json({ success: true, ok: true });
  response.cookies.delete("statiq_session");
  return response;
}
