import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

let genAIInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return genAIInstance;
}

export async function generateGeminiContent(
  prompt: string,
  systemInstruction?: string,
  modelName: string = "gemini-3.6-flash"
): Promise<string> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction: systemInstruction,
            temperature: 0.2,
          }
        : undefined,
    });

    return response.text || "";
  } catch (error: any) {
    console.error("[gemini-client] Generation error:", error);
    throw error;
  }
}
