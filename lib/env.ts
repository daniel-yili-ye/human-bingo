import "server-only";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// NEXT_PUBLIC_* values must be referenced statically so Next.js can inline them.
export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseKey() {
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
  // The AI keys are optional on their own; lib/ai.ts needs at least one of them.
  get groqApiKey() {
    return process.env.GROQ_API_KEY || undefined;
  },
  get groqModel() {
    return process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  },
  get geminiApiKey() {
    return process.env.GEMINI_API_KEY || undefined;
  },
  get geminiModel() {
    return process.env.GEMINI_MODEL || "gemini-3.8-flash";
  },
};
