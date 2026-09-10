import { runCompleteAnalysis } from "@/lib/ai/groq-orchestrator";
import { ok, fail } from "@/lib/api/http";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/analyze
 * Canonical AI Analyst endpoint
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message ?? body.question ?? "").trim();
    const sessionId = body.sessionId ? String(body.sessionId) : undefined;

    if (!message) {
      return fail("BAD_REQUEST", "Please provide a message or question for analysis.", 400);
    }
    const uiLanguage = body.uiLanguage && typeof body.uiLanguage === "string" ? body.uiLanguage : "en";

    const result = await runCompleteAnalysis(message, sessionId);

    // Translate if requested
    if (uiLanguage !== "en") {
      const { translateText } = await import("@/lib/translation/translation-service");
      
      const answerPromise = translateText({
        text: result.answer,
        sourceLanguage: "en",
        targetLanguage: uiLanguage,
        sourceType: "ai_response"
      });

      const titlePromise = translateText({
        text: result.title,
        sourceLanguage: "en",
        targetLanguage: uiLanguage,
        sourceType: "chart_title"
      });

      const [translatedAnswer, translatedTitle] = await Promise.all([answerPromise, titlePromise]);
      
      if (translatedAnswer.success && translatedAnswer.text) {
        result.answer = translatedAnswer.text;
      }
      
      if (translatedTitle.success && translatedTitle.text) {
        result.title = translatedTitle.text;
        if (result.chart) {
          result.chart.title = translatedTitle.text;
        }
      }
    }

    return ok({
      result,
      // Top-level aliases for resilient client parsing
      answer: result.answer,
      title: result.title,
      dataset: result.dataset,
      keyFindings: result.keyFindings,
      table: result.table,
      chart: result.chart,
      methodology: result.methodology,
      evidence: result.evidence,
      limitations: result.limitations,
      executionTrace: result.executionTrace,
    });
  } catch (err: any) {
    return fail("SERVER_ERROR", err.message || "An error occurred during statistical analysis.", 500);
  }
}
