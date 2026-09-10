import { NextRequest, NextResponse } from "next/server";
import { backendJson } from "@/lib/backend";

export async function GET(req: NextRequest) {
  try {
    const result = await backendJson("/api/health", { method: "GET" });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
