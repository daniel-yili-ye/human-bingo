import { cn } from "cn";
import Link from "next/link";

const DOTS = [9, 16, 23];

/** A card with one daubed diagonal. Mirrors app/icon.svg so the favicon matches. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-6", className)}>
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      {DOTS.flatMap((cy, row) =>
        DOTS.map((cx, col) =>
          row === col ? (
            <circle key={`${row}${col}`} cx={cx} cy={cy} r="3.2" className="fill-dauber" />
          ) : (
            <circle
              key={`${row}${col}`}
              cx={cx}
              cy={cy}
              r="2.5"
              className="fill-background opacity-30"
            />
          ),
        ),
      )}
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
      <LogoMark />
      Human Bingo
    </Link>
  );
}
