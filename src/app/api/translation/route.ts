import { NextResponse } from "next/server";
import { translateText } from "@/lib/translation/translation-service";
import { TranslationRequest } from "@/lib/translation/types";
import { z } from "zod";

const translationRequestSchema = z.object({
  text: z.string().min(1).max(10000), // Max 10000 characters
  sourceLanguage: z.string().min(2).max(5),
  targetLanguage: z.string().min(2).max(5),
  sourceType: z.string().optional().default("general"),
  bypassCache: z.boolean().optional().default(false),
});

export async function GET() {
  const hasUdyat = !!(process.env.BHASHINI_UDYAT_KEY || process.env.BHASHINI_ULCA_API_KEY);
  const hasInference = !!process.env.BHASHINI_INFERENCE_KEY;
  const hasUserId = !!process.env.BHASHINI_USER_ID;

  return NextResponse.json({
    status: "ok",
    provider: "BHASHINI",
    pipelineConfigured: hasUdyat && hasInference,
    authPresent: {
      udyat: hasUdyat,
      inference: hasInference,
      userId: hasUserId,
    },
    supportedLanguages: [
      "en", "hi", "pa", "bn", "mr", "ta", "te", "gu", "kn", "ml", "or", "as", "ur"
    ],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = translationRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { text, sourceLanguage, targetLanguage, sourceType, bypassCache } = validatedData.data;

    const request: TranslationRequest = {
      text,
      sourceLanguage,
      targetLanguage,
      sourceType: sourceType as any,
      bypassCache,
    };

    const response = await translateText(request);

    // Return structured translation result (credentials are never exposed)
    return NextResponse.json({
      success: response.success,
      text: response.text,
      sourceLanguage: response.sourceLanguage,
      targetLanguage: response.targetLanguage,
      cached: response.cached,
    });
  } catch (error: any) {
    console.error("Translation API Error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal Server Error", text: "" },
      { status: 500 }
    );
  }
}
