"use client";

import { PartyPopperIcon, RotateCcwIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { BingoCell } from "@/components/bingo-cell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useBoardProgress } from "@/hooks/use-board-progress";
import {
  describeLine,
  evaluateBingo,
  getFreeSpaceIndex,
  getWinningLines,
  type Board,
} from "@/lib/board";

type BingoBoardProps = {
  board: Pick<Board, "rows" | "cols" | "freeSpace" | "prompts">;
  /** Identifies this version of the board for saved progress. */
  storageKey: string;
  /** Extra controls shown beside Reset (e.g. a share button). */
  actions?: React.ReactNode;
};

export function BingoBoard({ board, storageKey, actions }: BingoBoardProps) {
  const { rows, cols, prompts } = board;
  const freeSpaceIndex = getFreeSpaceIndex(board);
  const lines = useMemo(() => getWinningLines(rows, cols), [rows, cols]);

  const { names, setName, reset } = useBoardProgress(storageKey, prompts.length);
  const result = useMemo(
    () => evaluateBingo(names, lines, freeSpaceIndex),
    [names, lines, freeSpaceIndex],
  );
  const lineCount = result.completedLines.length;

  function handleNameChange(index: number, name: string) {
    const before = result.completedLines;
    const after = evaluateBingo(names.with(index, name), lines, freeSpaceIndex).completedLines;
    setName(index, name);

    // Celebrate in direct response to the keystroke that completed a line,
    // so reloading a finished card does not re-announce old bingos.
    const newLine = after.find((line) => !before.includes(line));
    if (newLine) {
      toast.success(`Bingo! You completed ${describeLine(newLine)}.`, {
        icon: <PartyPopperIcon className="size-4" />,
        description: "Shout it out so everyone knows!",
      });
    }
  }

  const hasProgress = names.some((name) => name !== "");

  return (
    <section className="w-full">
      <div className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
          {lineCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-dauber px-2.5 py-0.5 font-medium text-dauber-foreground">
              <PartyPopperIcon aria-hidden="true" className="size-3.5" />
              Bingo{lineCount > 1 && ` ×${lineCount}`}
            </span>
          ) : (
            `${result.checked.filter(Boolean).length} of ${prompts.length} squares`
          )}
        </p>

        <div className="flex items-center gap-2">
          {actions}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" disabled={!hasProgress}>
                <RotateCcwIcon data-icon="inline-start" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your card?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every name you&apos;ve entered will be removed. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep playing</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={reset}>
                  Clear card
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Hairline rules between squares, like a printed card. */}
      <div
        className="grid gap-px overflow-hidden rounded-xl border bg-border"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {prompts.map((prompt, index) => (
          <BingoCell
            key={index}
            index={index}
            prompt={prompt}
            name={names[index]}
            checked={result.checked[index]}
            isDuplicate={result.duplicates.has(index)}
            isWinning={result.winningCells.has(index)}
            isFreeSpace={index === freeSpaceIndex}
            onNameChange={handleNameChange}
          />
        ))}
      </div>

      {result.duplicates.size > 0 && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Each person only counts once. Squares with a repeated name aren&apos;t marked.
        </p>
      )}
    </section>
  );
}
