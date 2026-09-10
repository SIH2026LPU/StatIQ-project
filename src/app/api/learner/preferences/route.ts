import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { learningPreferences, learnerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/rbac";

export async function PUT(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  try {
    const data = await req.json();
    
    const existingProfile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, session.id));
    if (existingProfile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profileId = existingProfile[0].id;
    const existingPrefs = await db.select().from(learningPreferences).where(eq(learningPreferences.learnerProfileId, profileId));
    
    let preferences;
    if (existingPrefs.length > 0) {
      const [updated] = await db.update(learningPreferences)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(learningPreferences.learnerProfileId, profileId))
        .returning();
      preferences = updated;
    } else {
      const [inserted] = await db.insert(learningPreferences)
        .values({
          ...data,
          learnerProfileId: profileId,
        })
        .returning();
      preferences = inserted;
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Failed to update learning preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
