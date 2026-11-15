import { cn } from "cn";
import { getFreeSpaceIndex, type Board } from "@/lib/board";

/** A thumbnail of a board's shape: one dot per square, the free space daubed. */
export function GridGlyph({
  grid,
  className,
}: {
  grid: Pick<Board, "rows" | "cols" | "freeSpace">;
  className?: string;
}) {
  const freeSpaceIndex = getFreeSpaceIndex(grid);

  return (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 gap-0.5", className)}
      style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: grid.rows * grid.cols }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-1.5 rounded-full",
            index === freeSpaceIndex ? "bg-dauber" : "bg-foreground/20",
          )}
        />
      ))}
    </span>
  );
}
