import Groq from "groq-sdk";
import type { SkillGap } from "../competency/gap-engine";

const GROQ_SKILL_GAP_SYSTEM_PROMPT = `You are StatIQ AI's Official Career Advisor.
You are explaining validated competency skill gaps for a user trying to reach their Target Role.

GROUNDING RULES:
1. Do NOT introduce any numeric competency score, requirement, gap, or percentage that does not exist in the structured JSON.
2. Do NOT invent fake courses or fake learning history.
3. You must explain what the gaps mean for the target role, why the high priority gaps matter, and highlight the user's strengths (no gap).
4. Keep your tone objective, rigorous, encouraging, and professional.
5. If the user has no gaps, congratulate them on being fully competent for the target role.
6. The output should be a single, cohesive 2-3 paragraph explanation. Avoid using Markdown tables or repetitive lists. Ensure it reads like a personalized career advisory memo.`;

export async function explainSkillGaps(
  currentRole: string,
  targetRole: string,
  gaps: SkillGap[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY || "";
  const modelName = process.env.GROQ_MODEL || process.env.AI_MODEL || "llama-3.3-70b-versatile";

  // If no Groq configured, return deterministic fallback
  if (!apiKey || !apiKey.startsWith("gsk_")) {
    return buildDeterministicExplanation(currentRole, targetRole, gaps);
  }

  // Filter out noise to avoid blowing up context or confusing the LLM
  const highPriority = gaps.filter((g) => g.gap > 0).sort((a, b) => b.priority - a.priority).slice(0, 5);
  const strengths = gaps.filter((g) => g.gap === 0);

  const structuredData = {
    currentRole: currentRole || "Unknown",
    targetRole: targetRole || "Unknown",
    topPriorityGaps: highPriority.map(g => ({
      competency: g.competencyName,
      domain: g.domain,
      current: g.currentScore,
      target: g.requiredLevel,
      gap: g.gap
    })),
    strengths: strengths.map(g => g.competencyName)
  };

  try {
    const groq = new Groq({ apiKey });
    const explainRes = await groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: GROQ_SKILL_GAP_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Explain my skill gap analysis results. Here is the validated data:\n${JSON.stringify(structuredData, null, 2)}`
        },
      ],
      temperature: 0.2, // low temp for factual adherence
    });

    return explainRes.choices[0]?.message?.content || buildDeterministicExplanation(currentRole, targetRole, gaps);
  } catch (err) {
    console.error("[skill-gap-explainer] Groq API failure:", err);
    return buildDeterministicExplanation(currentRole, targetRole, gaps);
  }
}

function buildDeterministicExplanation(currentRole: string, targetRole: string, gaps: SkillGap[]): string {
  if (gaps.length === 0) {
    return `You have not completed any competency assessments for the target role: ${targetRole}.`;
  }

  const withGaps = gaps.filter(g => g.gap > 0).sort((a, b) => b.priority - a.priority);
  const strengths = gaps.filter(g => g.gap === 0);

  if (withGaps.length === 0) {
    return `Excellent progress! Your current competency scores meet or exceed all the requirements for the ${targetRole} role. You are currently well-positioned to take on this responsibility.`;
  }

  const topGap = withGaps[0];
  let explanation = `To transition effectively to the ${targetRole} role, you should focus primarily on improving your proficiency in ${topGap.competencyName}, which currently has the largest priority gap (${topGap.gap} points). `;

  if (withGaps.length > 1) {
    explanation += `Other areas needing attention include ${withGaps.slice(1, 3).map(g => g.competencyName).join(' and ')}. `;
  }

  if (strengths.length > 0) {
    explanation += `However, your current proficiency in ${strengths.map(s => s.competencyName).slice(0, 3).join(', ')} already meets the target role requirements, forming a strong foundation to build upon.`;
  }

  return explanation;
}
