"use client";

import { cn } from "cn";
import { StarIcon } from "lucide-react";
import { useRef } from "react";

type BingoCellProps = {
  index: number;
  prompt: string;
  name: string;
  checked: boolean;
  isDuplicate: boolean;
  isWinning: boolean;
  isFreeSpace: boolean;
  onNameChange: (index: number, name: string) => void;
};

export function BingoCell({
  index,
  prompt,
  name,
  checked,
  isDuplicate,
  isWinning,
  isFreeSpace,
  onNameChange,
}: BingoCellProps) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div
      // The name line is small, so a click anywhere on the square starts typing on it.
      onClick={(event) => {
        const field = input.current;
        if (!field || event.target === field) return;
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
      }}
      className={cn(
        "bingo-square relative flex min-w-0 flex-col bg-card p-1 transition-colors sm:p-2",
        !isFreeSpace && "cursor-text",
        isWinning && "bg-dauber/10",
      )}
    >
      {checked && (
        // The dauber stamp: an uneven ink blob, turned a little differently
        // on every square so no two marks look machine-made.
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 mx-auto aspect-square rounded-[46%_54%_50%_50%/52%_46%_54%_48%] transition-colors motion-safe:animate-stamp",
            isFreeSpace ? "inset-y-0 my-auto w-[78%]" : "top-[3%] w-[70%]",
            isWinning ? "bg-dauber/55" : "bg-dauber/25",
          )}
          style={{ rotate: `${(index * 47) % 360}deg` }}
        />
      )}

      <p
        className={cn(
          "relative flex w-full flex-1 items-center justify-center text-center text-[10px] leading-tight font-medium text-balance wrap-anywhere sm:text-xs md:text-sm",
          // Full screen on a phone has height to spare, so the text can be bigger.
          "max-sm:group-data-full-screen/board:text-[11px]",
          isFreeSpace && "flex-col gap-0.5 font-semibold",
        )}
      >
        {isFreeSpace ? (
          <>
            <StarIcon aria-hidden="true" className="size-4 fill-current sm:size-5" />
            Free
          </>
        ) : (
          prompt
        )}
      </p>

      {!isFreeSpace && (
        // Styled as a line to write on, like a paper card.
        <input
          ref={input}
          type="text"
          value={name}
          onChange={(event) => onNameChange(index, event.target.value)}
          placeholder="name"
          aria-label={prompt ? `Name of someone who: ${prompt}` : `Name for blank square ${index + 1}`}
          aria-invalid={isDuplicate}
          title={isDuplicate ? "This name is already on another square" : undefined}
          maxLength={40}
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          className="relative mt-0.5 h-5 w-full min-w-0 shrink-0 rounded-none border-b border-dashed border-foreground/25 bg-transparent px-0.5 text-center text-[11px] font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground/60 focus-visible:border-solid focus-visible:border-foreground aria-invalid:border-destructive aria-invalid:text-destructive sm:h-6 sm:text-xs"
        />
      )}
    </div>
  );
}
