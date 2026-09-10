import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { tutorConversations, tutorMessages } from "@/db/schema/tutor";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const id = (await params).id;

  try {
    // Verify ownership
    const [conversation] = await db
      .select()
      .from(tutorConversations)
      .where(
        and(
          eq(tutorConversations.id, id),
          eq(tutorConversations.userId, session.userId)
        )
      );

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await db
      .select({
        id: tutorMessages.id,
        role: tutorMessages.role,
        content: tutorMessages.content,
        sources: tutorMessages.sourceMetadata,
        createdAt: tutorMessages.createdAt,
      })
      .from(tutorMessages)
      .where(eq(tutorMessages.conversationId, id))
      .orderBy(asc(tutorMessages.createdAt));

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error("[tutor-conversations-id] GET Error:", error);
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = (await params).id;

  try {
    const result = await db
      .delete(tutorConversations)
      .where(
        and(
          eq(tutorConversations.id, id),
          eq(tutorConversations.userId, session.userId)
        )
      )
      .returning({ id: tutorConversations.id });

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[tutor-conversations-id] DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
