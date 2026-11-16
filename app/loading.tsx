import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingProps = {
  /**
   * Which page shape to stand in for, so the layout does not jump in width
   * once the real page streams in: the board (default), the boards list, or
   * the two-column editor.
   */
  layout?: "board" | "list" | "editor";
};

const WIDTHS = {
  board: "max-w-xl",
  list: "max-w-xl",
  editor: "max-w-xl lg:max-w-5xl",
};

export default function Loading({ layout = "board" }: LoadingProps) {
  return (
    <main
      className={cn("mx-auto w-full flex-1 space-y-6 px-4 pt-6 pb-16", WIDTHS[layout])}
      aria-busy="true"
      aria-label="Loading"
    >
      {layout === "list" ? (
        <>
          <Skeleton className="h-8 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </>
      ) : (
        <>
          <div className={cn("space-y-2", layout === "editor" && "border-b pb-4")}>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          {layout === "editor" ? (
            <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
              <div className="space-y-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
              <Skeleton className="aspect-square w-full rounded-xl" />
            </div>
          ) : (
            <Skeleton className="aspect-square w-full rounded-xl" />
          )}
        </>
      )}
    </main>
  );
}
