import { z } from "zod";

export const MIN_SIZE = 3;
export const MAX_SIZE = 6;
export const SIZES = Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, i) => MIN_SIZE + i);
export const MAX_TITLE_LENGTH = 80;
export const MAX_PROMPT_LENGTH = 100;
export const MAX_TOPIC_LENGTH = 300;
export const SLUG_PATTERN = /^[A-Za-z0-9_-]{12}$/;

export type Board = {
  slug: string;
  title: string;
  rows: number;
  cols: number;
  freeSpace: boolean;
  /** One entry per cell in row-major order; the free-space cell is "". */
  prompts: string[];
  updatedAt: string;
};

export type BingoLine = {
  type: "row" | "column" | "diagonal";
  /** Zero-based row/column number, or 0/1 for the two diagonals. */
  index: number;
  cells: number[];
};

/** A free space needs a single centre cell, which only exists on odd × odd grids. */
export function canHaveFreeSpace(rows: number, cols: number): boolean {
  return rows % 2 === 1 && cols % 2 === 1;
}

/** Index of the free-space cell, or -1 when the board has none. */
export function getFreeSpaceIndex({
  rows,
  cols,
  freeSpace,
}: Pick<Board, "rows" | "cols" | "freeSpace">): number {
  if (!freeSpace || !canHaveFreeSpace(rows, cols)) return -1;
  return Math.floor((rows * cols) / 2);
}

/** Number of cells that need a prompt. */
export function getPromptCount(grid: Pick<Board, "rows" | "cols" | "freeSpace">): number {
  return grid.rows * grid.cols - (getFreeSpaceIndex(grid) === -1 ? 0 : 1);
}

/** Every row and column, plus both diagonals when the grid is square. */
export function getWinningLines(rows: number, cols: number): BingoLine[] {
  const range = (length: number) => Array.from({ length }, (_, i) => i);
  const lines: BingoLine[] = [
    ...range(rows).map((r) => ({
      type: "row" as const,
      index: r,
      cells: range(cols).map((c) => r * cols + c),
    })),
    ...range(cols).map((c) => ({
      type: "column" as const,
      index: c,
      cells: range(rows).map((r) => r * cols + c),
    })),
  ];

  if (rows === cols) {
    lines.push(
      { type: "diagonal", index: 0, cells: range(rows).map((i) => i * cols + i) },
      { type: "diagonal", index: 1, cells: range(rows).map((i) => i * cols + (cols - 1 - i)) },
    );
  }
  return lines;
}

export type BingoResult = {
  /** Cells that count towards a line (valid name, or the free space). */
  checked: boolean[];
  /** Cells whose name repeats an earlier cell; these do not count. */
  duplicates: Set<number>;
  completedLines: BingoLine[];
  winningCells: Set<number>;
};

/** Scores a card. Each person's name may only be used once per card. */
export function evaluateBingo(
  names: readonly string[],
  lines: readonly BingoLine[],
  freeSpaceIndex: number,
): BingoResult {
  const seen = new Set<string>();
  const duplicates = new Set<number>();

  const checked = names.map((name, index) => {
    if (index === freeSpaceIndex) return true;
    const key = name.trim().toLocaleLowerCase();
    if (!key) return false;
    if (seen.has(key)) {
      duplicates.add(index);
      return false;
    }
    seen.add(key);
    return true;
  });

  const completedLines = lines.filter((line) => line.cells.every((cell) => checked[cell]));
  const winningCells = new Set(completedLines.flatMap((line) => line.cells));

  return { checked, duplicates, completedLines, winningCells };
}

export function describeLine(line: BingoLine): string {
  return line.type === "diagonal" ? "a diagonal" : `${line.type} ${line.index + 1}`;
}

const size = z.number().int().min(MIN_SIZE).max(MAX_SIZE);
// Collapse whitespace so prompts cannot smuggle in newlines or padding.
const singleLine = z.string().transform((value) => value.replace(/\s+/g, " ").trim());

/** Validates a board submitted from the editor. Shared by client and server. */
export const boardInputSchema = z
  .object({
    title: singleLine.pipe(
      z
        .string()
        .min(1, "Give your board a title.")
        .max(MAX_TITLE_LENGTH, `Keep the title under ${MAX_TITLE_LENGTH} characters.`),
    ),
    rows: size,
    cols: size,
    freeSpace: z.boolean(),
    prompts: z.array(singleLine.pipe(z.string().max(MAX_PROMPT_LENGTH))).max(MAX_SIZE * MAX_SIZE),
  })
  .transform((board) => ({
    ...board,
    freeSpace: board.freeSpace && canHaveFreeSpace(board.rows, board.cols),
  }))
  .superRefine((board, ctx) => {
    if (board.prompts.length !== board.rows * board.cols) {
      ctx.addIssue({ code: "custom", message: "The board does not match its dimensions." });
      return;
    }
    const freeSpaceIndex = getFreeSpaceIndex(board);
    const empty = board.prompts.filter((p, i) => i !== freeSpaceIndex && !p).length;
    if (empty > 0) {
      ctx.addIssue({
        code: "custom",
        message: `Fill in every square (${empty} still empty).`,
      });
    }
  })
  .transform((board) => {
    const freeSpaceIndex = getFreeSpaceIndex(board);
    return {
      ...board,
      prompts: board.prompts.map((p, i) => (i === freeSpaceIndex ? "" : p)),
    };
  });

export type BoardInput = z.input<typeof boardInputSchema>;

export const generateInputSchema = z.object({
  topic: singleLine.pipe(
    z
      .string()
      .min(3, "Describe your group or event in a few words.")
      .max(MAX_TOPIC_LENGTH, `Keep the description under ${MAX_TOPIC_LENGTH} characters.`),
  ),
  count: z
    .number()
    .int()
    .min(1)
    .max(MAX_SIZE * MAX_SIZE),
});

/** First human-readable message from a failed parse. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Something is not right. Please check the form.";
}

export type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };
