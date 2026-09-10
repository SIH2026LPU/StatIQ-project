import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { tutorConversations } from "@/db/schema/tutor";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await db
      .select({
        id: tutorConversations.id,
        title: tutorConversations.title,
        updatedAt: tutorConversations.updatedAt,
      })
      .from(tutorConversations)
      .where(eq(tutorConversations.userId, session.userId))
      .orderBy(desc(tutorConversations.updatedAt))
      .limit(50);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[tutor-conversations] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [conversation] = await db
      .insert(tutorConversations)
      .values({
        userId: session.userId,
        title: "New Conversation",
      })
      .returning({
        id: tutorConversations.id,
        title: tutorConversations.title,
        updatedAt: tutorConversations.updatedAt,
      });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[tutor-conversations] POST Error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
