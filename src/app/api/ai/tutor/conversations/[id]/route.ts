import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { 
  getConversationById, 
  deleteConversationById 
} from "@/lib/tutor-store";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conv = getConversationById(id);

  if (!conv) {
    return NextResponse.json({ 
      conversation: { id, title: "New Conversation", updatedAt: new Date().toISOString() },
      messages: [] 
    });
  }

  return NextResponse.json({
    conversation: {
      id: conv.id,
      title: conv.title,
      updatedAt: conv.updatedAt,
    },
    messages: conv.messages,
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  deleteConversationById(id);

  return NextResponse.json({ success: true, id });
}
