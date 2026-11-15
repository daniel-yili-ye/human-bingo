import { cn } from "cn";
import { StarIcon } from "lucide-react";

/** The numbered tag that ties a square on the preview to its text field. */
export function SquareNumber({
  number,
  active,
  className,
}: {
  number: number;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] leading-none font-medium text-muted-foreground tabular-nums transition-colors",
        active && "bg-dauber text-dauber-foreground",
        className,
      )}
    >
      {number}
    </span>
  );
}

type BoardPreviewProps = {
  title: string;
  cols: number;
  /** One entry per grid cell: the index of its prompt, or null for the free space. */
  cells: readonly (number | null)[];
  prompts: readonly string[];
  /** Prompt index currently being edited, if any. */
  activeIndex: number | null;
  onSelect: (promptIndex: number) => void;
};

/** The card as players will see it, updating as the form changes. */
export function BoardPreview({
  title,
  cols,
  cells,
  prompts,
  activeIndex,
  onSelect,
}: BoardPreviewProps) {
  return (
    <section aria-label="Board preview" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          className={cn(
            "min-w-0 truncate text-lg font-semibold tracking-tight",
            !title.trim() && "text-muted-foreground",
          )}
        >
          {title.trim() || "Untitled board"}
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground">Live preview</span>
      </div>

      <div
        className="grid gap-px overflow-hidden rounded-xl border bg-border"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.map((promptIndex, cellIndex) => {
          if (promptIndex === null) {
            return (
              <div
                key={cellIndex}
                className="relative flex aspect-square flex-col items-center justify-center gap-0.5 bg-card text-[10px] font-semibold sm:text-xs"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 m-auto aspect-square w-[78%] rounded-[46%_54%_50%_50%/52%_46%_54%_48%] bg-dauber/25"
                />
                <StarIcon aria-hidden="true" className="relative size-4 fill-current" />
                <span className="relative">Free</span>
              </div>
            );
          }

          const prompt = prompts[promptIndex].trim();
          const active = promptIndex === activeIndex;
          return (
            <button
              key={cellIndex}
              type="button"
              onClick={() => onSelect(promptIndex)}
              aria-label={`Edit square ${promptIndex + 1}${prompt ? `: ${prompt}` : " (empty)"}`}
              className={cn(
                "relative flex aspect-square min-w-0 flex-col overflow-hidden bg-card p-1 text-center transition-colors outline-none hover:bg-muted focus-visible:bg-muted sm:p-1.5",
                active && "bg-dauber/10 hover:bg-dauber/10",
              )}
            >
              <SquareNumber
                number={promptIndex + 1}
                active={active}
                className="size-4 text-[9px]"
              />
              <span
                className={cn(
                  "flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden text-[10px] leading-tight font-medium text-balance wrap-anywhere sm:text-xs",
                  !prompt && "font-normal text-muted-foreground/60",
                )}
              >
                {prompt || "Empty"}
              </span>
              {/* The line players write a name on. */}
              <span
                aria-hidden="true"
                className="mt-0.5 h-2 w-full shrink-0 border-b border-dashed border-foreground/25"
              />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Numbers match the fields in the list and don&apos;t appear on the shared board. Select a
        square to edit it.
      </p>
    </section>
  );
}
