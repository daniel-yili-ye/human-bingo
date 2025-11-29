"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type BingoCellProps = {
  prompt: string;
  checked: boolean;
  note: string;
  isWinning: boolean;
  isFreeSpace: boolean;
  onNoteChange: (note: string) => void;
};

export function BingoCell({
  prompt,
  checked,
  note,
  isWinning,
  isFreeSpace,
  onNoteChange,
}: BingoCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNoteChange(e.target.value);
  };

  return (
    <div
      className={cn(
        "relative h-full flex flex-col items-center justify-center p-1.5 sm:p-2 md:p-3",
        "border border-border/50 rounded-lg",
        "transition-all duration-300 ease-out",
        "select-none group",
        checked && !isWinning && "bg-primary/10 border-primary/30",
        isWinning &&
          "bg-linear-to-br from-amber-400/30 to-orange-500/30 border-amber-500/50 shadow-lg shadow-amber-500/20",
        isWinning && "animate-pulse",
        !checked && "bg-card hover:bg-accent/30"
      )}
    >
      {/* Checkmark overlay */}
      {checked && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            "transition-opacity duration-300"
          )}
        >
          <svg
            className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20",
              isWinning ? "text-amber-500/40" : "text-primary/20"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Prompt text - full text, no truncation */}
      <p
        className={cn(
          "text-[10px] sm:text-xs md:text-sm font-medium text-center leading-tight",
          checked ? "text-foreground/70" : "text-foreground",
          isFreeSpace && "font-bold text-primary"
        )}
      >
        {prompt}
      </p>

      {/* Note input */}
      {!isFreeSpace && (
        <div className="w-full mt-1 sm:mt-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Name..."
            value={note}
            onChange={handleInputChange}
            className={cn(
              "h-5 sm:h-6 md:h-7 text-[9px] sm:text-[10px] md:text-xs",
              "bg-background/50 border-border/30 placeholder:text-muted-foreground/50",
              "focus:bg-background focus:border-primary/50",
              "text-center px-1",
              checked && "border-primary/30 bg-primary/5"
            )}
          />
        </div>
      )}

      {/* Free space star */}
      {isFreeSpace && (
        <div className="absolute top-1 right-1">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}
    </div>
  );
}
