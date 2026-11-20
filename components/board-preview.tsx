import { cn } from "cn";
import { Loader2Icon, StarIcon } from "lucide-react";

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
  /** True while the squares are being drafted, so the card shows placeholders. */
  pending?: boolean;
  /** A single square being rewritten, shown as a placeholder on its own. */
  pendingIndex?: number | null;
};

/** The card as players will see it, updating as the form changes. */
export function BoardPreview({
  title,
  cols,
  cells,
  prompts,
  activeIndex,
  onSelect,
  pending = false,
  pendingIndex = null,
}: BoardPreviewProps) {
  return (
    <section aria-label="Board preview" aria-busy={pending} className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          className={cn(
            "min-w-0 truncate text-lg font-semibold tracking-tight",
            !title.trim() && "text-muted-foreground",
          )}
        >
          {title.trim() || "Untitled board"}
        </h2>
        {pending ? (
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-dauber">
            <Loader2Icon aria-hidden="true" className="size-3 animate-spin" />
            Drafting squares…
          </span>
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground">Live preview</span>
        )}
      </div>

      <div
        className={cn(
          "bingo-grid overflow-hidden rounded-xl border bg-border transition-shadow",
          pending && "ring-2 ring-dauber/40",
        )}
        style={{ "--cols": cols } as React.CSSProperties}
      >
        {cells.map((promptIndex, cellIndex) => {
          if (promptIndex === null) {
            return (
              <div
                key={cellIndex}
                className="bingo-square relative flex flex-col items-center justify-center gap-0.5 bg-card text-[10px] font-semibold sm:text-xs"
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
              disabled={pending}
              aria-label={`Edit square ${promptIndex + 1}${prompt ? `: ${prompt}` : " (empty)"}`}
              className={cn(
                "bingo-square relative flex min-w-0 flex-col bg-card p-1 text-center transition-colors outline-none hover:bg-muted focus-visible:bg-muted sm:p-1.5",
                active && "bg-dauber/10 hover:bg-dauber/10",
              )}
            >
              <SquareNumber
                number={promptIndex + 1}
                active={active}
                className="size-4 text-[9px]"
              />
              {pending || promptIndex === pendingIndex ? (
                // Placeholder lines that pulse in a diagonal wave across the card.
                <span
                  aria-hidden="true"
                  className="flex min-h-0 w-full flex-1 animate-pulse flex-col items-center justify-center gap-1 motion-reduce:animate-none"
                  style={
                    pending
                      ? {
                          animationDelay: `${(Math.floor(cellIndex / cols) + (cellIndex % cols)) * 120}ms`,
                        }
                      : undefined
                  }
                >
                  <span className="h-1.5 w-4/5 rounded-full bg-dauber/40" />
                  <span className="h-1.5 w-3/5 rounded-full bg-dauber/40" />
                </span>
              ) : (
                <span
                  className={cn(
                    "flex w-full flex-1 items-center justify-center text-[10px] leading-tight font-medium text-balance wrap-anywhere sm:text-xs",
                    !prompt && "font-normal text-muted-foreground/60",
                  )}
                >
                  {prompt || "Blank"}
                </span>
              )}
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
        <span className="lg:hidden">
          Tap a square to write or regenerate it. Numbers don&apos;t appear on the shared board.
        </span>
        <span className="max-lg:hidden">
          Numbers match the fields in the list and don&apos;t appear on the shared board. Select a
          square to edit it.
        </span>
      </p>
    </section>
  );
}
