import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || process.env.AI_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [{ role: "user", content: "Hello!" }],
      max_tokens: 50,
    });
    console.log("Response:", completion.choices[0]?.message?.content);
  } catch (error: any) {
    console.error("Failed to list models", error.message);
  }
}

main();
