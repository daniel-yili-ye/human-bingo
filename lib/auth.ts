import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

const asString = (value: unknown) => (typeof value === "string" && value ? value : null);

/** Only same-origin relative paths are allowed as post-login destinations. */
export function safeNextPath(next: unknown, fallback = "/boards"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}

export function loginPath(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}

/**
 * The signed-in user, verified against the JWT signature (never trusted from
 * the raw cookie). Deduplicated per request.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const metadata = (claims.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: claims.sub,
    email: asString(claims.email),
    name: asString(metadata.full_name) ?? asString(metadata.name),
    avatarUrl: asString(metadata.avatar_url) ?? asString(metadata.picture),
  };
});

/** Redirects to the login page when signed out. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(loginPath(next));
  return user;
}
