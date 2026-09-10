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

// In-flight request deduplication map to prevent redundant concurrent API calls
const inFlightRequests = new Map<string, Promise<TranslationResponse>>();

export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const { text, sourceLanguage, targetLanguage, sourceType, bypassCache } = request;

  if (!text || text.trim() === "") {
    return { success: true, text: "", sourceLanguage, targetLanguage, cached: false };
  }

  // If languages are the same, return original text
  if (sourceLanguage === targetLanguage) {
    return { success: true, text, sourceLanguage, targetLanguage, cached: false };
  }

  const hash = generateHash(text);
  const dedupKey = `${sourceLanguage}:${targetLanguage}:${hash}`;

  // If there is already an in-flight request for the identical text and language pair, reuse its promise
  if (inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey)!;
  }

  const translationPromise = (async (): Promise<TranslationResponse> => {
    const db = getDb();
    const providerVersion = "bhashini-v2";

    // 1. Check Database Cache
    if (!bypassCache) {
      try {
        const cachedResult = await db.query.translationCache.findFirst({
          where: and(
            eq(translationCache.sourceTextHash, hash),
            eq(translationCache.sourceLanguage, sourceLanguage),
            eq(translationCache.targetLanguage, targetLanguage)
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
        // Continue to Bhashini API even if DB cache lookup is unavailable
      }
    }

    // 2. Protect Tokens (Numbers, Dataset IDs, Code blocks, URLs)
    const protectedText = protectTranslationTokens(text);

    // 3. Call Provider (Real Bhashini Pipeline)
    const providerResponse = await translateViaBhashini(
      protectedText.template,
      sourceLanguage,
      targetLanguage
    );

    if (!providerResponse.success) {
      return {
        success: false,
        text: text, // Fallback safely to original text
        sourceLanguage,
        targetLanguage,
        cached: false,
        error: providerResponse.error,
      };
    }

    // 4. Restore Protected Tokens
    const finalText = restoreTranslationTokens(protectedText, providerResponse.text);

    // 5. Save to Cache asynchronously
    try {
      await db.insert(translationCache).values({
        sourceTextHash: hash,
        sourceLanguage,
        targetLanguage,
        sourceType: sourceType || "general",
        translatedText: finalText,
        provider: "bhashini",
        providerVersion: providerVersion,
      });
    } catch (e) {
      // Non-fatal, return translated text
    }

    return {
      success: true,
      text: finalText,
      sourceLanguage,
      targetLanguage,
      cached: false,
    };
  })();

  inFlightRequests.set(dedupKey, translationPromise);
  try {
    const result = await translationPromise;
    return result;
  } finally {
    inFlightRequests.delete(dedupKey);
  }
}
