import { z } from "zod";
import { getGroqClient, getConfiguredModel } from "./groq-client";

export async function generateMcqsWithAI(input: {
  topic: string;
  competencyId: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
  sourceExcerpt?: string;
}) {
  const count = Math.max(1, Math.min(input.count || 3, 10));
  const prompt = `You are a Senior Statistical Assessment Specialist for India's National Statistical System (MoSPI / NSSO / CSO / Indian Statistical Service).
Generate ${count} high-quality, technically rigorous Multiple Choice Questions (MCQs) for the topic: "${input.topic}".
Competency Domain: ${input.competencyId}.
Target Difficulty: ${input.difficulty}.
${input.sourceExcerpt ? `Grounding Source Context:\n"""${input.sourceExcerpt}"""` : ""}

Rules for each MCQ:
1. Question stem must be clear, scenario- or calculation- or methodology-based.
2. Must have exactly 4 options.
3. Only 1 option is unequivocally correct.
4. Correct index is 0, 1, 2, or 3.
5. Provide a detailed, professional statistical explanation.

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "prompt": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explanation here..."
    }
  ]
}`;

  try {
    const groq = getGroqClient();
    const model = getConfiguredModel();
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are an official psychometric exam designer for national statistics and data science. Always return pure JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions.map((q: any, i: number) => ({
        id: `ai-gen-${Date.now()}-${i}`,
        competencyId: input.competencyId,
        difficulty: input.difficulty,
        prompt: q.prompt,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
        explanation: q.explanation || "Official MoSPI statistical standard.",
        sourceDocumentId: "mospi-official-handbook",
        status: "published" as const,
      }));
    }
  } catch (err) {
    console.warn("[QUIZ_GEN][WARN] Groq AI quiz gen fallback to templates:", err);
  }

  // Fallback to deterministic statistical questions
  return generateMcqs(input);
}

export function generateMcqs(input: {
  topic: string;
  competencyId: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
  sourceExcerpt?: string;
}) {
  const schema = z.object({
    topic: z.string().min(2),
    competencyId: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    count: z.number().int().min(1).max(10),
  });
  schema.parse({ ...input, count: Math.max(1, Math.min(input.count || 3, 10)) });

  const statisticalQuestionBank = [
    {
      prompt: `In the context of ${input.topic}, what is the primary methodology recommended by MoSPI for compiling index numbers (such as WPI/CPI)?`,
      options: [
        "Unweighted arithmetic mean of price relatives without item basket revision.",
        "Laspeyres formula with base-year weights, chaining, and geometric mean for micro-items.",
        "Simple median price aggregation across all state centers.",
        "Harmonic mean of maximum retail prices without quality adjustments.",
      ],
      correctIndex: 1,
      explanation:
        "Official Indian price indices (WPI, CPI) predominantly utilize Laspeyres base-weighted formulation with item-level geometric mean aggregation.",
    },
    {
      prompt: `When conducting large-scale sample surveys like PLFS or HCES under ${input.topic}, how are sampling weights (Multipliers) determined?`,
      options: [
        "Uniform multiplier of 1.0 is assigned to every surveyed household.",
        "Inverse of the inclusion probability based on the multi-stage stratified sample design.",
        "Weights are determined arbitrarily by the field investigator during data entry.",
        "Only self-weighting designs are permitted without post-stratification.",
      ],
      correctIndex: 1,
      explanation:
        "Sampling multipliers in NSSO surveys reflect the inverse probability of selection at each stage of the stratified multi-stage design.",
    },
    {
      prompt: `For ${input.topic}, how should outliers in Annual Survey of Industries (ASI) unit-record data be validated?`,
      options: [
        "Instantly delete any record where gross output deviates by more than 10%.",
        "Verify against previous round panel data, physical input ratios (e.g., fuel/power consumption), and contact unit if unverified.",
        "Replace raw figures with synthetic averages generated by a neural model.",
        "Exclude all micro and small enterprise returns from aggregate tabulation.",
      ],
      correctIndex: 1,
      explanation:
        "ASI validation protocols require cross-referencing input-output technical coefficients (power, raw material vs output) before imputation or editing.",
    },
    {
      prompt: `Under ${input.topic} data governance protocols, what is the mandatory measure before releasing public microdata?`,
      options: [
        "Direct publication with full enterprise GSTIN and geo-coordinates intact.",
        "Statistical disclosure control (SDC), identifier masking, and top-coding of sensitive economic variables.",
        "Distributing raw databases via unauthenticated HTTP endpoints.",
        "Publishing only aggregate PDF press releases with no microdata access.",
      ],
      correctIndex: 1,
      explanation:
        "National Data Sharing and Accessibility Policy (NDSAP) requires Statistical Disclosure Control (SDC) to prevent unit re-identification.",
    },
  ];

  return Array.from({ length: input.count }, (_, index) => {
    const base = statisticalQuestionBank[index % statisticalQuestionBank.length];
    return {
      id: `gen-${Date.now()}-${index}`,
      competencyId: input.competencyId,
      difficulty: input.difficulty,
      prompt: base.prompt,
      options: base.options,
      correctIndex: base.correctIndex,
      explanation: base.explanation,
      sourceDocumentId: "mospi-official-handbook",
      status: "published" as const,
    };
  });
}

export function validateQuestion(question: {
  options: string[];
  correctIndex: number;
  prompt: string;
  sourceDocumentId?: string;
}) {
  const issues: string[] = [];
  if (question.options.length !== 4) issues.push("MCQ must have exactly four options.");
  if (new Set(question.options.map((item) => item.trim().toLowerCase())).size !== question.options.length) {
    issues.push("Duplicate options detected.");
  }
  if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
    issues.push("Correct answer index is invalid.");
  }
  if (question.prompt.trim().length < 12) issues.push("Stem is too short or ambiguous.");
  if (!question.sourceDocumentId) issues.push("Missing source grounding.");
  return { ok: issues.length === 0, issues };
}
