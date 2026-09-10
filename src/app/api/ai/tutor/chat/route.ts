import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { askDualEngineTutor } from "@/lib/ai/dual-engine-tutor";

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

  try {
    const tutorResult = await askDualEngineTutor(
      message.trim(),
      Array.isArray(history) ? history : []
    );

    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: tutorResult.answer,
        provider: tutorResult.provider,
        engineLabel: tutorResult.engineLabel,
        modelUsed: tutorResult.modelUsed,
        failoverOccurred: tutorResult.failoverOccurred,
        failoverReason: tutorResult.failoverReason,
        sources: tutorResult.sources,
        createdAt: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    console.error("[tutor-chat] Dual-engine dispatcher error:", err);
    return NextResponse.json(
      { error: "The AI Learning Tutor is currently processing high volume. Please try again." },
      { status: 500 }
    );
  }
}
