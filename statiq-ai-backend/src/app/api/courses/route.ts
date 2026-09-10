import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getIGOTProvider } from "@/lib/integrations/provider-factory";

/**
 * GET /api/courses?q=python
 * Merges the internal PostgreSQL catalogue with the iGOT provider (mock today,
 * official adapter later) so the frontend always calls one endpoint regardless
 * of where a course actually lives.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  const internal = await db.select().from(courses).where(eq(courses.isAvailable, true));

  const igot = await getIGOTProvider().searchCourses(q);

  const merged = [
    ...internal.map((c) => ({
      source: "INTERNAL" as const,
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      durationHours: c.durationHours,
      sourceUrl: c.sourceUrl,
    })),
    ...igot.map((c) => ({
      source: "IGOT" as const,
      id: c.externalId,
      title: c.title,
      difficulty: c.difficulty,
      durationHours: c.durationHours,
      sourceUrl: c.sourceUrl,
    })),
  ];

  return NextResponse.json({ count: merged.length, courses: merged });
}
