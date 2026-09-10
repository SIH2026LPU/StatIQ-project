import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { queryMoSPI } from "@/lib/integrations/mospi-mcp/query-service";

export async function POST(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const result = await queryMoSPI(query);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Query Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
