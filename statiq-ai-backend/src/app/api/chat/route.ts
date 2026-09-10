import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { embedText, searchSimilarChunks } from "@/lib/rag/embed";
import { db } from "@/db";
import { aiInteractions } from "@/db/schema";
import OpenAI from "openai";

const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? "gpt-3.5-turbo";

export async function POST(req: NextRequest) {
  const user = await getSession(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const question = String(body.question ?? "").trim();
  
  if (!question) {
    return NextResponse.json({ error: "Question required." }, { status: 400 });
  }

  if (!AI_API_KEY) {
    return NextResponse.json({
      error: "AI_API_KEY not configured. Contact your administrator to enable the AI Tutor.",
      sources: []
    }, { status: 503 });
  }

  try {
    const startTime = Date.now();
    // 1. Search for similar chunks using pgvector (which uses Node embedding + SQL)
    const similarChunksResult = await searchSimilarChunks(question, { limit: 4 });
    const similarChunks = (similarChunksResult as any) as unknown as { id: string, document_id: string, content: string, page_number: number, section: string }[];

    if (!similarChunks || similarChunks.length === 0) {
      return NextResponse.json({
        answer: "I do not have enough indexed source material to answer that. Please upload or index an approved document, or rephrase your question using a known topic.",
        sources: [],
      });
    }

    const context = similarChunks.map((c, i) => `[Source ${i + 1}] ${c.content}`).join("\n\n");
    const systemPrompt = `You are the StatIQ AI Tutor, an assistant for official statisticians.
Use the following context from approved learning materials to answer the user's question.
If the answer is not contained in the context, say "I cannot find the answer in the approved materials."
Do not invent information.

Context:
${context}`;

    const openai = new OpenAI({ apiKey: AI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.1,
    });

    const answer = completion.choices[0]?.message?.content ?? "Failed to generate answer.";
    const latencyMs = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens ?? 0;

    // Log the interaction
    await db.insert(aiInteractions).values({
      employeeId: user.employeeId ?? null,
      interactionType: "TUTOR",
      prompt: question,
      retrievedChunkIds: similarChunks.map(c => c.id),
      response: answer,
      model: AI_MODEL,
      latencyMs,
      tokensUsed,
    });

    const sources = similarChunks.map((chunk, index) => ({
      documentId: chunk.document_id,
      title: `Source ${index + 1}`, // Assuming we fetch title in a real join, but keeping it simple
      excerpt: chunk.content.substring(0, 150) + "...",
    }));

    return NextResponse.json({ answer, sources });

  } catch (error) {
    console.error("AI Tutor Error:", error);
    return NextResponse.json({ error: "An error occurred while generating the answer." }, { status: 500 });
  }
}
