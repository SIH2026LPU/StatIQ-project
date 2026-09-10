import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { learnerProfiles, learnerSkills, careerGoals, learningPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/rbac";

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  try {
    const [profile] = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, session.id));
    if (!profile) return NextResponse.json({ profile: null });

    const skills = await db.select().from(learnerSkills).where(eq(learnerSkills.learnerProfileId, profile.id));
    const [goal] = await db.select().from(careerGoals).where(eq(careerGoals.learnerProfileId, profile.id));
    const [preferences] = await db.select().from(learningPreferences).where(eq(learningPreferences.learnerProfileId, profile.id));

    return NextResponse.json({
      profile,
      skills,
      careerGoal: goal || null,
      learningPreferences: preferences || null,
    });
  } catch (error) {
    console.error("Failed to fetch learner profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  try {
    const data = await req.json();
    
    // Check if profile exists
    const existing = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, session.id));
    
    let profile;
    if (existing.length > 0) {
      const [updated] = await db.update(learnerProfiles)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(learnerProfiles.userId, session.id))
        .returning();
      profile = updated;
    } else {
      const [inserted] = await db.insert(learnerProfiles)
        .values({
          ...data,
          userId: session.id,
        })
        .returning();
      profile = inserted;
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to update learner profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
