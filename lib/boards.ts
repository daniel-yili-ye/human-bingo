import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { SLUG_PATTERN, type Board } from "@/lib/board";
import { startOfDayInZone } from "@/lib/dates";
import { createClient, createPublicClient } from "@/lib/supabase/server";

export const boardTag = (slug: string) => `board:${slug}`;

type BoardColumns = {
  slug: string;
  title: string;
  row_count: number;
  col_count: number;
  free_space: boolean;
  prompts: string[];
  updated_at: string;
};

const BOARD_COLUMNS = "slug, title, row_count, col_count, free_space, prompts, updated_at";

function toBoard(row: BoardColumns): Board {
  return {
    slug: row.slug,
    title: row.title,
    rows: row.row_count,
    cols: row.col_count,
    freeSpace: row.free_space,
    prompts: row.prompts,
    updatedAt: row.updated_at,
  };
}

/** Public lookup by share link. Cached until the owner edits or deletes it. */
export async function getBoardBySlug(slug: string): Promise<Board | null> {
  "use cache";
  cacheTag(boardTag(slug));

  if (!SLUG_PATTERN.test(slug)) {
    cacheLife("max");
    return null;
  }

  const { data, error } = await createPublicClient()
    .rpc("get_board_by_slug", { p_slug: slug })
    .maybeSingle();
  if (error) throw new Error(`Failed to load board: ${error.message}`);

  // Misses expire quickly so guessed links cannot pin entries in the cache.
  if (!data) {
    cacheLife("minutes");
    return null;
  }
  cacheLife("days");
  return toBoard(data);
}

/** A board the signed-in user owns (RLS hides everyone else's). */
export async function getOwnBoard(slug: string): Promise<Board | null> {
  if (!SLUG_PATTERN.test(slug)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select(BOARD_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load board: ${error.message}`);
  return data ? toBoard(data) : null;
}

export type BoardSummary = Pick<Board, "slug" | "title" | "rows" | "cols" | "freeSpace"> & {
  createdAt: string;
};

export type BoardListFilters = {
  /** Matches anywhere in the title. */
  search: string;
  /** Inclusive created-date range, as YYYY-MM-DD or empty. */
  from: string;
  to: string;
  /** The time zone those days are in, such as "America/Toronto". */
  timeZone: string;
};

/** The signed-in user's boards that match the filters, newest first. */
export async function listOwnBoards(filters: BoardListFilters): Promise<BoardSummary[]> {
  const supabase = await createClient();
  let query = supabase
    .from("boards")
    .select("slug, title, row_count, col_count, free_space, created_at");
  if (filters.search) {
    // Escape the LIKE wildcards so they are matched literally.
    query = query.ilike("title", `%${filters.search.replace(/[\\%_]/g, "\\$&")}%`);
  }
  const from = startOfDayInZone(filters.from, filters.timeZone);
  // Up to, but not including, the start of the following day.
  const until = startOfDayInZone(filters.to, filters.timeZone, 1);
  if (from) query = query.gte("created_at", from.toISOString());
  if (until) query = query.lt("created_at", until.toISOString());
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load boards: ${error.message}`);

  return data.map((row) => ({
    slug: row.slug,
    title: row.title,
    rows: row.row_count,
    cols: row.col_count,
    freeSpace: row.free_space,
    createdAt: row.created_at,
  }));
}
