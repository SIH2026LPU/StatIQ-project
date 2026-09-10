import crypto from "crypto";
import { getDb } from "@/db/client";
import { translationCache } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TranslationRequest, TranslationResponse } from "./types";
import { protectTranslationTokens, restoreTranslationTokens } from "./protected-text";
import { translateViaBhashini } from "./bhashini";

function generateHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const { text, sourceLanguage, targetLanguage, sourceType, bypassCache } = request;
  const db = getDb();

  if (!text || text.trim() === "") {
    return { success: true, text: "", sourceLanguage, targetLanguage, cached: false };
  }

  // If languages are the same, return as is
  if (sourceLanguage === targetLanguage) {
    return { success: true, text, sourceLanguage, targetLanguage, cached: false };
  }

  const hash = generateHash(text);
  const providerVersion = "bhashini-v1"; // Could be dynamic if we query config often

  // 1. Check PostgreSQL Cache
  if (!bypassCache) {
    try {
      const cachedResult = await db.query.translationCache.findFirst({
        where: and(
          eq(translationCache.sourceTextHash, hash),
          eq(translationCache.sourceLanguage, sourceLanguage),
          eq(translationCache.targetLanguage, targetLanguage),
          eq(translationCache.sourceType, sourceType),
          eq(translationCache.providerVersion, providerVersion)
        ),
      });

      if (cachedResult) {
        return {
          success: true,
          text: cachedResult.translatedText,
          sourceLanguage,
          targetLanguage,
          cached: true,
        };
      }
    } catch (e) {
      console.error("Translation cache lookup failed:", e);
      // Continue to provider even if cache fails
    }
  }

  // 2. Protect Tokens (Numbers, IDs, Markdown)
  const protectedText = protectTranslationTokens(text);

  // 3. Call Provider (Bhashini)
  const providerResponse = await translateViaBhashini(
    protectedText.template,
    sourceLanguage,
    targetLanguage
  );

  if (!providerResponse.success) {
    console.error("Bhashini translation failed:", providerResponse.error);
    return {
      success: false,
      text: text, // Fallback to original English text
      sourceLanguage,
      targetLanguage,
      cached: false,
      error: providerResponse.error,
    };
  }

  // 4. Restore Tokens
  const finalText = restoreTranslationTokens(protectedText, providerResponse.text);

  // 5. Save to Cache
  try {
    await db.insert(translationCache).values({
      sourceTextHash: hash,
      sourceLanguage,
      targetLanguage,
      sourceType,
      translatedText: finalText,
      provider: "bhashini",
      providerVersion: providerVersion,
    });
  } catch (e) {
    console.error("Translation cache save failed:", e);
    // Non-fatal error, do not break the response
  }

  return {
    success: true,
    text: finalText,
    sourceLanguage,
    targetLanguage,
    cached: false,
  };
}
