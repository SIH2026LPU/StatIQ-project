import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db";
import { tutorConversations, tutorMessages } from "@/db/schema/tutor";
import { employees, jobRoles } from "@/db/schema/org";
import { employeeCompetencies, competencies } from "@/db/schema/competency";
import { eq, and, asc } from "drizzle-orm";
import { createCompletion } from "@/lib/ai/groq-client";
import { searchSimilarChunks } from "@/lib/rag/embed";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { conversationId, message } = body;
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: "Conversation ID and message required." }, { status: 400 });
  }

  // 1. Verify conversation ownership
  const [conv] = await db
    .select()
    .from(tutorConversations)
    .where(
      and(
        eq(tutorConversations.id, conversationId),
        eq(tutorConversations.userId, session.userId)
      )
    );

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // 2. Fetch history
  const history = await db
    .select({ role: tutorMessages.role, content: tutorMessages.content })
    .from(tutorMessages)
    .where(eq(tutorMessages.conversationId, conversationId))
    .orderBy(asc(tutorMessages.createdAt));

  // If first message, update title
  if (history.length === 0) {
    const title = message.length > 40 ? message.substring(0, 37) + "..." : message;
    await db.update(tutorConversations).set({ title, updatedAt: new Date() }).where(eq(tutorConversations.id, conversationId));
  } else {
    await db.update(tutorConversations).set({ updatedAt: new Date() }).where(eq(tutorConversations.id, conversationId));
  }

  // 3. Save User Message
  await db.insert(tutorMessages).values({
    conversationId,
    role: "user",
    content: message,
  });

  // 4. Fetch Learner Context (Target Role, Competencies)
  let learnerContextStr = "Current Role: Unknown\n";
  
  if (session.employeeId) {
    const [emp] = await db
      .select({
        designation: employees.designation,
        jobRoleId: employees.jobRoleId,
      })
      .from(employees)
      .where(eq(employees.id, session.employeeId));

    if (emp) {
      learnerContextStr = `Current Role: ${emp.designation || "Unknown"}\n`;
      if (emp.jobRoleId) {
        const [jobRole] = await db.select({ title: jobRoles.title }).from(jobRoles).where(eq(jobRoles.id, emp.jobRoleId));
        if (jobRole) learnerContextStr += `Job Role Title: ${jobRole.title}\n`;
      }
    }

    const comps = await db
      .select({
        name: competencies.name,
        score: employeeCompetencies.currentScore,
      })
      .from(employeeCompetencies)
      .innerJoin(competencies, eq(competencies.id, employeeCompetencies.competencyId))
      .where(eq(employeeCompetencies.employeeId, session.employeeId))
      .limit(5);

    if (comps.length > 0) {
      learnerContextStr += `Current Competency Scores:\n` + comps.map(c => `- ${c.name}: ${c.score}/5`).join("\n");
    }
  }

  // 5. Fetch RAG Context
  let ragContextStr = "";
  let sourcesList: any[] = [];
  try {
    const similarChunksResult = await searchSimilarChunks(message, { limit: 3 });
    const similarChunks = similarChunksResult as unknown as { id: string, document_id: string, content: string }[];
    if (similarChunks && similarChunks.length > 0) {
      ragContextStr = similarChunks.map((c, i) => `[Document ${i + 1}] ${c.content}`).join("\n\n");
      sourcesList = similarChunks.map((chunk, index) => ({
        name: `Reference Document ${index + 1}`,
        type: "official",
        excerpt: chunk.content.substring(0, 150) + "..."
      }));
    }
  } catch (e: any) {
    if (e.message && e.message.includes("RAG_UNAVAILABLE")) {
      console.warn("[tutor-chat] RAG search skipped: Embedding service not configured.");
    } else {
      console.warn("[tutor-chat] RAG search failed, continuing without official RAG context", e);
    }
  }

  // 6. Build Prompt & Call Groq
  const systemPrompt = `You are StatIQ AI Tutor, an educational assistant for learners working with India's official statistical ecosystem.
Explain concepts clearly and accurately.
Use verified context supplied by StatIQ. Do not invent official statistics, government policies, or competency requirements.
If evidence is unavailable, explicitly say that the information is not available in the supplied sources.
Use the learner's context only to personalize explanations. Use markdown formatting. Do not use unsafe HTML.

---
LEARNER CONTEXT:
${learnerContextStr}

---
OFFICIAL STATIQ KNOWLEDGE CONTEXT:
${ragContextStr || "No specific official statistics documents found for this query."}
`;

  try {
    // Format history
    const apiMessages: any[] = [{ role: "system", content: systemPrompt }];
    // keep last 10 messages
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      apiMessages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.content });
    }
    // append new user message
    apiMessages.push({ role: "user", content: message });

    const completion = await createCompletion(apiMessages, { temperature: 0.2 });
    const answer = completion.content || "I'm sorry, I couldn't generate a response.";

    // 7. Save Assistant Message
    const [savedAssistantMsg] = await db.insert(tutorMessages).values({
      conversationId,
      role: "assistant",
      content: answer,
      sourceMetadata: sourcesList.length > 0 ? sourcesList : null,
    }).returning({ id: tutorMessages.id, role: tutorMessages.role, content: tutorMessages.content, sources: tutorMessages.sourceMetadata, createdAt: tutorMessages.createdAt });

    return NextResponse.json({ message: savedAssistantMsg });
  } catch (error) {
    console.error("[tutor-chat] Groq Error:", error);
    return NextResponse.json({ error: "The AI Tutor is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
