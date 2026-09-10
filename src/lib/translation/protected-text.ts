export interface ProtectedText {
  original: string;
  template: string;
  tokens: Record<string, string>;
}

/**
 * Protects numbers, dataset IDs, URLs, and {{placeholders}} from translation.
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

  // 1. URLs
  template = template.replace(/https?:\/\/[^\s]+/g, replaceWithToken);

  // 2. {{placeholders}}
  template = template.replace(/\{\{[^}]+\}\}/g, replaceWithToken);

  // 3. Dataset IDs (e.g. IND-CSO-ASI-1983-84)
  template = template.replace(/[A-Z]+-[A-Z]+-[A-Z0-9-]+/g, replaceWithToken);

  // 4. Numbers with optional decimals and percentages (e.g. 167.02, 5.42%, 2026)
  // Be careful not to match inside words.
  template = template.replace(/\b\d+(\.\d+)?%?\b/g, replaceWithToken);

  // 5. Markdown structure like headers (###) or bullets (-) or bold (**)
  // This is a simplified regex; a real AST parser is better for complex markdown,
  // but this suffices for basic AI responses.
  template = template.replace(/(^|\n)(#{1,6}\s|- |\* )/g, replaceWithToken);
  template = template.replace(/\*\*[^*]+\*\*/g, replaceWithToken);
  
  return {
    original: text,
    template,
    tokens,
  };
}

export function restoreTranslationTokens(protectedText: ProtectedText, translatedTemplate: string): string {
  let restored = translatedTemplate;
  for (const [token, originalValue] of Object.entries(protectedText.tokens)) {
    // Note: Use global replace in case translation duplicated the token (rare but possible)
    restored = restored.replace(new RegExp(token, 'g'), originalValue);
  }
  return restored;
}
