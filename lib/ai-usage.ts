import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AiUsage = {
  /** Generations in the last hour. */
  used: number;
  /** How many are allowed per hour. */
  limit: number;
  /** When the next one frees up, or null when none have been used. */
  nextFreeAt: string | null;
};

/**
 * The signed-in user's AI generations in the current hour. Returns null when
 * it cannot be read, so the editor simply leaves the count out.
 */
export async function getAiUsage(): Promise<AiUsage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ai_usage").maybeSingle();
  if (error || !data) {
    if (error) console.error("get_ai_usage failed", error);
    return null;
  }
  return { used: data.used, limit: data.hourly_limit, nextFreeAt: data.next_free_at };
}
