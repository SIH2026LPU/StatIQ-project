import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { askDualEngineTutor } from "@/lib/ai/dual-engine-tutor";
import { addMessageToConversation, getConversationById } from "@/lib/tutor-store";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const body = await request.json().catch(() => ({}));
  const { conversationId, message, history } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const userId = session.id || session.email || "default";
  const convId = conversationId || `conv-${Date.now()}`;

  // 1. Persist user message to store
  addMessageToConversation(
    convId,
    {
      id: `usr-${Date.now()}`,
      role: "user",
      content: message.trim(),
    },
    userId
  );

  // 2. Build history from stored conversation if available
  const existingConv = getConversationById(convId);
  const conversationHistory = existingConv
    ? existingConv.messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
    : Array.isArray(history) ? history : [];

  try {
    const tutorResult = await askDualEngineTutor(
      message.trim(),
      conversationHistory
    );

    const assistantMsg = {
      id: `ast-${Date.now()}`,
      role: "assistant" as const,
      content: tutorResult.answer,
      provider: tutorResult.provider,
      engineLabel: tutorResult.engineLabel,
      modelUsed: tutorResult.modelUsed,
      failoverOccurred: tutorResult.failoverOccurred,
      failoverReason: tutorResult.failoverReason,
      sources: tutorResult.sources,
      createdAt: new Date().toISOString(),
    };

    // 3. Persist assistant response to store
    addMessageToConversation(convId, assistantMsg, userId);

    return NextResponse.json({
      conversationId: convId,
      message: assistantMsg,
    });
  } catch (err: any) {
    console.error("[tutor-chat] Dual-engine dispatcher error:", err);
    return NextResponse.json(
      { error: "The AI Learning Tutor is currently processing high volume. Please try again." },
      { status: 500 }
    );
  }
}
