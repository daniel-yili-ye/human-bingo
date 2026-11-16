"use server";

import { nanoid } from "nanoid";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { AiUnavailableError, generateBingoPrompts } from "@/lib/ai";
import { getUser } from "@/lib/auth";
import {
  boardInputSchema,
  firstIssue,
  generateInputSchema,
  SLUG_PATTERN,
  type ActionResult,
} from "@/lib/board";
import { boardTag } from "@/lib/boards";
import { createClient } from "@/lib/supabase/server";

const SIGNED_OUT = { ok: false, error: "Please sign in again." } as const;
const SAVE_FAILED = { ok: false, error: "Could not save your board. Please try again." } as const;

/** Maps validated editor input onto table columns. */
function toColumns(input: ReturnType<typeof boardInputSchema.parse>) {
  return {
    title: input.title,
    row_count: input.rows,
    col_count: input.cols,
    free_space: input.freeSpace,
    prompts: input.prompts,
  };
}

export async function createBoard(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return SIGNED_OUT;

  const parsed = boardInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const slug = nanoid(12);
  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .insert({ ...toColumns(parsed.data), slug, owner_id: user.id });

  if (error) {
    if (error.code === "P0001") {
      return { ok: false, error: "You have reached the board limit. Delete one to make room." };
    }
    console.error("createBoard failed", error);
    return SAVE_FAILED;
  }

  redirect(`/b/${slug}`);
}

export async function updateBoard(slug: string, input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return SIGNED_OUT;
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) return SAVE_FAILED;

  const parsed = boardInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  // RLS restricts the update to boards the caller owns.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .update(toColumns(parsed.data))
    .eq("slug", slug)
    .select("slug");

  if (error || data.length === 0) {
    if (error) console.error("updateBoard failed", error);
    return SAVE_FAILED;
  }

  updateTag(boardTag(slug));
  redirect(`/b/${slug}`);
}

export async function deleteBoard(slug: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return SIGNED_OUT;

  const failed = { ok: false, error: "Could not delete that board." } as const;
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) return failed;

  const supabase = await createClient();
  const { data, error } = await supabase.from("boards").delete().eq("slug", slug).select("slug");

  if (error || data.length === 0) {
    if (error) console.error("deleteBoard failed", error);
    return failed;
  }

  updateTag(boardTag(slug));
  refresh();
  return { ok: true };
}

export async function generatePrompts(input: unknown): Promise<ActionResult<string[]>> {
  const user = await getUser();
  if (!user) return SIGNED_OUT;

  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { data: allowed, error } = await supabase.rpc("consume_ai_generation");
  if (error) {
    console.error("consume_ai_generation failed", error);
    return { ok: false, error: "Could not generate squares. Please try again." };
  }
  if (!allowed) {
    return { ok: false, error: "You have hit the hourly AI limit. Try again a little later." };
  }

  try {
    const prompts = await generateBingoPrompts(parsed.data.topic, parsed.data.count);
    return { ok: true, data: prompts };
  } catch (cause) {
    if (!(cause instanceof AiUnavailableError)) throw cause;
    // Log the underlying error too: the wrapper alone hides whether this was
    // a timeout, a quota limit or a rejected model.
    console.error("generatePrompts failed:", cause.message, "-", String(cause.cause));
    return { ok: false, error: "The AI is busy right now. Try again in a moment." };
  }
}
