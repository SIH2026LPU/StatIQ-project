import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { 
  getConversationsForUser, 
  createConversation 
} from "@/lib/tutor-store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.id || session.email || "default";
  const convs = getConversationsForUser(userId);

  return NextResponse.json({
    conversations: convs.map(c => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
    }))
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.id || session.email || "default";
  const body = await req.json().catch(() => ({}));
  const id = body.id || `conv-${Date.now()}`;
  const title = body.title || "New Conversation";

  const conversation = createConversation(id, title, userId);

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
    }
  });
}
