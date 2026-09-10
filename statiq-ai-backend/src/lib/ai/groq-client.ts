import Groq from "groq-sdk";

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY || "";
  if (!apiKey || !apiKey.startsWith("gsk_")) {
    throw new Error("AI service unavailable (Check GROQ_API_KEY)");
  }
  return new Groq({ apiKey });
}

export function getConfiguredModel() {
  return process.env.GROQ_MODEL || process.env.AI_MODEL || "groq/compound";
}

export async function createCompletion(messages: any[], options: any = {}) {
  const groq = getGroqClient();
  const model = getConfiguredModel();
  
  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      ...options
    });
    
    if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
      throw new Error("Invalid response format from Groq API");
    }
    
    return {
      content: response.choices[0].message.content,
      modelUsed: model
    };
  } catch (error: any) {
    console.error(`[GROQ][ERROR] status=${error?.status} model=${model} message=${error?.message}`);
    throw new Error("AI_ERROR");
  }
}
