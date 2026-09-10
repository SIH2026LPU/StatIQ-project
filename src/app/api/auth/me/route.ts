import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";

export async function GET() {
  const session = await requireSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    ok: true,
    data: {
      user: session
    }
  });
}
