import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { learnerSkills, learnerProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/rbac";

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  try {
    const data = await req.json();
    
    // Ensure profile exists
    const existingProfile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, session.id));
    if (existingProfile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [skill] = await db.insert(learnerSkills)
      .values({
        ...data,
        learnerProfileId: existingProfile[0].id,
      })
      .returning();

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Failed to add skill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const existingProfile = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, session.id));
    if (existingProfile.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await db.delete(learnerSkills).where(
      and(
        eq(learnerSkills.id, id),
        eq(learnerSkills.learnerProfileId, existingProfile[0].id)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete skill:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
