export interface ProtectedText {
  original: string;
  template: string;
  tokens: Record<string, string>;
}

/**
 * Protects code blocks, numbers, dataset IDs, currencies, URLs, and {{placeholders}} from translation.
 */
export function protectTranslationTokens(text: string): ProtectedText {
  const tokens: Record<string, string> = {};
  let template = text;
  let counter = 0;

  const replaceWithToken = (match: string) => {
    const token = `__TKN${counter++}__`;
    tokens[token] = match;
    return token;
  };

  // 1. Multi-line Code blocks
  template = template.replace(/```[\s\S]*?```/g, replaceWithToken);

  // 2. Inline code
  template = template.replace(/`[^`]+`/g, replaceWithToken);

  // 3. URLs
  template = template.replace(/https?:\/\/[^\s]+/g, replaceWithToken);

  // 4. {{placeholders}}
  template = template.replace(/\{\{[^}]+\}\}/g, replaceWithToken);

  // 5. Official Dataset IDs (e.g. IND-CSO-ASI-1983-84, MOSPI-CPI-2024)
  template = template.replace(/\b[A-Z]{2,}(?:-[A-Z0-9]+)+\b/g, replaceWithToken);

  // 6. Currency amounts and percentages (e.g. ₹50,000, $12.4M, 12.4%, 98.6%)
  template = template.replace(/[₹$€£]\s?\d+(?:,\d+)*(?:\.\d+)?(?:\s?[kKmMbBtT]|%|cr|lakh)?/g, replaceWithToken);

  // 7. Standalone percentages and numbers with decimal precision (e.g. 12.4%, 2026, 45.8)
  template = template.replace(/\b\d+(?:,\d+)*(?:\.\d+)?%\b/g, replaceWithToken);

  return {
    original: text,
    template,
    tokens,
  };
}

export function restoreTranslationTokens(protectedText: ProtectedText, translatedTemplate: string): string {
  let restored = translatedTemplate;
  for (const [token, originalValue] of Object.entries(protectedText.tokens)) {
    restored = restored.replace(new RegExp(token, 'g'), originalValue);
  }
  return restored;
}
