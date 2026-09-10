import { NextResponse } from "next/server";
import { getDb, hasDatabaseUrl } from "@/db";
import { dataSourceRegistry } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      success: true,
      postgres: false,
      sources: [],
      warning: "DATABASE_URL is not set on the backend process.",
    });
  }

  try {
    const db = getDb();
    const sources = await db.select().from(dataSourceRegistry);
    return NextResponse.json({ success: true, postgres: true, sources });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        postgres: false,
        sources: [],
        error: error instanceof Error ? error.message : "query failed",
      },
      { status: 503 },
    );
  }
}
