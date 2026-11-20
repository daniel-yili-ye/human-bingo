"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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
          placeholder="Has run a marathon"
          aria-label={`Square ${current + 1}`}
          maxLength={MAX_PROMPT_LENGTH}
          rows={2}
          enterKeyHint={isLast ? "done" : "next"}
          autoComplete="off"
        />

        <div className="flex items-center justify-end gap-2">
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
      </DialogContent>
    </Dialog>
  );
}
