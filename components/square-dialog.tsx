"use client";

import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MAX_PROMPT_LENGTH } from "@/lib/board";

type SquareDialogProps = {
  /** Prompt index being edited, or null when closed. */
  index: number | null;
  /** How many squares the board has, for stepping between them. */
  count: number;
  value: string;
  onChange: (value: string) => void;
  onRegenerate: () => void;
  regenerating: boolean;
  /** Blocks the AI button while something else is in flight. */
  disabled?: boolean;
  onNavigate: (index: number) => void;
  onClose: () => void;
};

/**
 * Edits one square: the way to change squares on phones, where the board has
 * no list of text fields beside it. Changes apply as they are typed.
 */
export function SquareDialog({
  index,
  count,
  value,
  onChange,
  onRegenerate,
  regenerating,
  disabled = false,
  onNavigate,
  onClose,
}: SquareDialogProps) {
  const open = index !== null;
  const current = index ?? 0;
  const isLast = current >= count - 1;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {/* Near the top on phones, so the keyboard does not cover it. */}
      <DialogContent className="max-sm:top-4 max-sm:translate-y-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="tabular-nums">
            Square {current + 1} of {count}
          </DialogTitle>
          <DialogDescription>
            Something a person in the room could be or have done. Leave it empty for a blank square.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            // Squares are a single line, so Enter moves on instead.
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            if (isLast) onClose();
            else onNavigate(current + 1);
          }}
          placeholder={regenerating ? "Writing…" : "Has run a marathon"}
          aria-label={`Square ${current + 1}`}
          maxLength={MAX_PROMPT_LENGTH}
          rows={2}
          enterKeyHint={isLast ? "done" : "next"}
          autoComplete="off"
          // Read-only rather than disabled, so the keyboard stays up on phones.
          readOnly={regenerating}
          aria-busy={regenerating}
          className={cn(regenerating && "animate-pulse motion-reduce:animate-none")}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onRegenerate}
            disabled={disabled || regenerating}
          >
            {regenerating ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <SparklesIcon data-icon="inline-start" />
            )}
            {regenerating ? "Writing…" : value.trim() ? "Regenerate" : "Write with AI"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous square"
              onClick={() => onNavigate(current - 1)}
              disabled={current === 0}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next square"
              onClick={() => onNavigate(current + 1)}
              disabled={isLast}
            >
              <ChevronRightIcon />
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
