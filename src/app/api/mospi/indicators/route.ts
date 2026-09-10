import { NextRequest, NextResponse } from "next/server";
import { backendJson } from "@/lib/backend";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const result = await backendJson(`/api/mospi/indicators?${queryString}`, { method: "GET" });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
