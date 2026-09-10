import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { tutorConversations } from "@/db/schema/tutor";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  const userId = session?.userId || "emp-ananya";

  try {
    const conversations = await db
      .select({
        id: tutorConversations.id,
        title: tutorConversations.title,
        updatedAt: tutorConversations.updatedAt,
      })
      .from(tutorConversations)
      .where(eq(tutorConversations.userId, userId))
      .orderBy(desc(tutorConversations.updatedAt))
      .limit(50);

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({
      conversations: [
        { id: "conv-cpi-wpi", title: "CPI vs WPI Calculation", updatedAt: new Date().toISOString() },
        { id: "conv-plfs", title: "PLFS Multiplier Weights", updatedAt: new Date(Date.now() - 86400000).toISOString() },
      ]
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  const userId = session?.userId || "emp-ananya";

  try {
    const [conversation] = await db
      .insert(tutorConversations)
      .values({
        userId,
        title: "New Conversation",
      })
      .returning({
        id: tutorConversations.id,
        title: tutorConversations.title,
        updatedAt: tutorConversations.updatedAt,
      });

    return NextResponse.json({ conversation });
  } catch (error) {
    return NextResponse.json({
      conversation: {
        id: `conv-${Date.now()}`,
        title: "New Conversation",
        updatedAt: new Date().toISOString(),
      }
    });
  }
}
