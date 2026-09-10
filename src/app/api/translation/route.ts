import { NextResponse } from "next/server";
import { translateText } from "@/lib/translation/translation-service";
import { TranslationRequest } from "@/lib/translation/types";
import { z } from "zod";

const translationRequestSchema = z.object({
  text: z.string().min(1).max(5000), // Max 5000 characters to prevent abuse
  sourceLanguage: z.string().length(2),
  targetLanguage: z.string().length(2),
  sourceType: z.enum([
    "ui_static",
    "dataset_description",
    "course_description",
    "ai_response",
    "chart_title",
    "table_label",
    "help_content"
  ]),
});

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

    const request: TranslationRequest = validatedData.data;

    const response = await translateText(request);

    // If we couldn't translate, we still return 200 with the fallback text
    // The client handles it gracefully
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
