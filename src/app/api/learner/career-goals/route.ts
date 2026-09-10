import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { careerGoals, learnerProfiles } from "@/db/schema";
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
    const existingGoal = await db.select().from(careerGoals).where(eq(careerGoals.learnerProfileId, profileId));
    
    let goal;
    if (existingGoal.length > 0) {
      const [updated] = await db.update(careerGoals)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(careerGoals.learnerProfileId, profileId))
        .returning();
      goal = updated;
    } else {
      const [inserted] = await db.insert(careerGoals)
        .values({
          ...data,
          learnerProfileId: profileId,
        })
        .returning();
      goal = inserted;
    }

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Failed to update career goal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
