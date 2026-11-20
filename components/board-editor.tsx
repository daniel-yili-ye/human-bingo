"use client";

import { cn } from "cn";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { useId, useState, useSyncExternalStore, useTransition } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { createBoard, generatePrompts, updateBoard } from "@/actions/boards";
import { BoardPreview, SquareNumber } from "@/components/board-preview";
import { GridGlyph } from "@/components/grid-glyph";
import { SquareDialog } from "@/components/square-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog";
import type { AiUsage } from "@/lib/ai-usage";
import {
  boardInputSchema,
  canHaveFreeSpace,
  firstIssue,
  getFreeSpaceIndex,
  getPromptCount,
  MAX_PROMPT_LENGTH,
  MAX_SIZE,
  MAX_TITLE_LENGTH,
  MAX_TOPIC_LENGTH,
  SIZES,
  type Board,
} from "@/lib/board";

const MAX_PROMPTS = MAX_SIZE * MAX_SIZE;
/** From this width the squares have text fields beside the board (Tailwind's lg). */
const SIDE_BY_SIDE = "(min-width: 64rem)";

/** Pads or trims to the largest possible board so resizing never loses text. */
const toPromptList = (prompts: readonly string[] = []) =>
  Array.from({ length: MAX_PROMPTS }, (_, i) => prompts[i] ?? "");

function SizeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Focuses a text field with the cursor after its last character, ready to type. */
function focusAtEnd(field: HTMLElement | null) {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
  field.focus();
  field.setSelectionRange(field.value.length, field.value.length);
}

const subscribe = () => () => {};
const timeFormat = new Intl.DateTimeFormat("en", { timeStyle: "short" });

/** How many AI drafts are left this hour, and when the next one frees up. */
function AiUsageNote({ usage }: { usage: AiUsage }) {
  const left = Math.max(0, usage.limit - usage.used);
  // The server cannot know the viewer's time zone, so the time is added in the browser.
  const nextFreeAt = useSyncExternalStore(
    subscribe,
    () => (usage.nextFreeAt ? timeFormat.format(new Date(usage.nextFreeAt)) : null),
    () => null,
  );

  return (
    <p
      className={cn(
        "text-xs text-muted-foreground tabular-nums",
        left === 0 && "font-medium text-foreground",
      )}
    >
      {left > 0
        ? `${left} of ${usage.limit} drafts left this hour`
        : nextFreeAt
          ? `No drafts left. Next one at ${nextFreeAt}`
          : "No drafts left this hour"}
    </p>
  );
}

type BoardEditorProps = {
  /** Omitted for the create form. */
  board?: Board;
  /** The user's AI usage when the page loaded, or null when unknown. */
  aiUsage?: AiUsage | null;
};

/** Create form when `board` is omitted, edit form otherwise. */
export function BoardEditor({ board, aiUsage: initialAiUsage = null }: BoardEditorProps) {
  const id = useId();
  const [title, setTitle] = useState(board?.title ?? "");
  const [rows, setRows] = useState(board?.rows ?? 5);
  const [cols, setCols] = useState(board?.cols ?? 5);
  const [wantsFreeSpace, setWantsFreeSpace] = useState(board?.freeSpace ?? true);
  // Prompts are kept as a flat list without the free space, so toggling it or
  // resizing the grid simply shows more or fewer of them.
  const [prompts, setPrompts] = useState(() => {
    if (!board) return toPromptList();
    const freeSpaceIndex = getFreeSpaceIndex(board);
    return toPromptList(board.prompts.filter((_, i) => i !== freeSpaceIndex));
  });
  const [topic, setTopic] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isGenerating, startGenerating] = useTransition();
  // Square open in the dialog.
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [confirmingDraft, setConfirmingDraft] = useState(false);
  const [aiUsage, setAiUsage] = useState(initialAiUsage);

  // Compared with how the form started, to warn before unsaved work is lost.
  const snapshot = JSON.stringify([title, rows, cols, wantsFreeSpace, prompts]);
  const [savedSnapshot] = useState(snapshot);

  const freeSpaceAllowed = canHaveFreeSpace(rows, cols);
  const grid = { rows, cols, freeSpace: wantsFreeSpace && freeSpaceAllowed };
  const promptCount = getPromptCount(grid);
  const visiblePrompts = prompts.slice(0, promptCount);
  const filledCount = visiblePrompts.filter((prompt) => prompt.trim()).length;
  const busy = isSaving || isGenerating;

  // Grid cells in row-major order, each pointing at its prompt (null = free space).
  const freeSpaceIndex = getFreeSpaceIndex(grid);
  const cells = Array.from({ length: rows * cols }, (_, cell) => {
    if (cell === freeSpaceIndex) return null;
    return freeSpaceIndex !== -1 && cell > freeSpaceIndex ? cell - 1 : cell;
  });
  const squareId = (index: number) => `${id}-square-${index}`;

  function generate() {
    startGenerating(async () => {
      const result = await generatePrompts({ topic, count: promptCount });
      if (result.usage) setAiUsage(result.usage);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPrompts((current) => toPromptList([...result.data, ...current.slice(result.data.length)]));
      setError(null);
      toast.success(`Generated ${result.data.length} squares`, {
        description: "Edit any of them before saving.",
      });
    });
  }

  const dialogFieldId = `${id}-dialog-square`;

  /** Puts the cursor in a square's text: its field on desktop, the dialog on phones. */
  function selectSquare(index: number) {
    if (window.matchMedia(SIDE_BY_SIDE).matches) {
      focusAtEnd(document.getElementById(squareId(index)));
      return;
    }
    // Rendered at once so the focus below is still part of the tap: phones only
    // bring up the keyboard for a focus that comes straight from a touch.
    flushSync(() => setDialogIndex(index));
    focusAtEnd(document.getElementById(dialogFieldId));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();

    // The free space is stored as an empty prompt so prompts line up with cells.
    const input = {
      title,
      ...grid,
      prompts: cells.map((index) => (index === null ? "" : visiblePrompts[index])),
    };
    const parsed = boardInputSchema.safeParse(input);
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }

    setError(null);
    startSaving(async () => {
      // On success the action redirects, so a returned value is always a failure.
      const result = board ? await updateBoard(board.slug, input) : await createBoard(input);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    // Explicit columns: an automatic one would grow to fit a long title on one
    // line and push the page wider than the screen.
    <form onSubmit={save} noValidate className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
      <FieldGroup className="min-w-0">
        <Field>
          <FieldLabel htmlFor={`${id}-title`}>Title</FieldLabel>
          <Input
            id={`${id}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Team offsite icebreaker"
            maxLength={MAX_TITLE_LENGTH}
            autoComplete="off"
            required
          />
        </Field>

        <div className="flex items-end gap-4">
          <div className="grid flex-1 grid-cols-2 gap-4">
            <SizeSelect label="Rows" value={rows} onChange={setRows} />
            <SizeSelect label="Columns" value={cols} onChange={setCols} />
          </div>
          {/* Live picture of the card's shape; fixed box so the form never shifts. */}
          <span className="flex size-12 shrink-0 items-center justify-center">
            <GridGlyph grid={grid} />
          </span>
        </div>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-free`}>Free space in the centre</FieldLabel>
            <FieldDescription>
              {freeSpaceAllowed
                ? "The middle square starts already marked."
                : "Needs an odd number of rows and columns."}
            </FieldDescription>
          </FieldContent>
          <Switch
            id={`${id}-free`}
            checked={grid.freeSpace}
            onCheckedChange={setWantsFreeSpace}
            disabled={!freeSpaceAllowed}
          />
        </Field>
      </FieldGroup>

      {/* Above the board on phones, so a draft lands on the card just below it. */}
      <FieldGroup className="min-w-0 lg:col-start-1">
        <FieldSeparator className="max-lg:hidden" />

        <div className="space-y-1">
          <h2 className="font-medium">Squares</h2>
          <FieldDescription>
            Something a person in the room could be or have done. One per square, or leave some
            blank.
          </FieldDescription>
        </div>

        <div
          className={cn(
            "space-y-2 rounded-lg border bg-muted/50 p-3 transition-colors",
            isGenerating && "border-dauber/50 bg-dauber/5",
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <FieldLabel htmlFor={`${id}-topic`}>Draft them with AI</FieldLabel>
            {aiUsage && <AiUsageNote usage={aiUsage} />}
          </div>
          <Textarea
            id={`${id}-topic`}
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Welcome night for new engineering interns who love board games"
            maxLength={MAX_TOPIC_LENGTH}
            rows={2}
            className="bg-background"
            disabled={isGenerating}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              role="status"
              className={cn(
                "text-xs text-muted-foreground",
                isGenerating && "font-medium text-dauber",
              )}
            >
              {isGenerating
                ? `Writing ${promptCount} squares. This takes a few seconds.`
                : filledCount > 0
                  ? "Replaces the squares on the board."
                  : "Describe your group or event. You can edit the results."}
            </p>
            <Button
              type="button"
              variant="outline"
              // Squares with text get a warning first, since a draft overwrites them.
              onClick={() => (filledCount > 0 ? setConfirmingDraft(true) : generate())}
              disabled={busy || topic.trim().length < 3}
            >
              {isGenerating ? (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              ) : (
                <SparklesIcon data-icon="inline-start" />
              )}
              {isGenerating ? "Drafting…" : `Draft ${promptCount} squares`}
            </Button>
          </div>
        </div>
      </FieldGroup>

      {/* Under the AI draft on phones; pinned alongside the form on desktop. */}
      <div className="min-w-0 lg:col-start-2 lg:row-span-3 lg:row-start-1">
        <div className="lg:sticky lg:top-20">
          <BoardPreview
            title={title}
            cols={cols}
            cells={cells}
            prompts={visiblePrompts}
            activeIndex={activeIndex ?? dialogIndex}
            onSelect={selectSquare}
            pending={isGenerating}
          />
        </div>
      </div>

      <FieldGroup className="min-w-0 lg:col-start-1">
        {/* Desktop only: on phones a square is edited by tapping it on the board. */}
        <ol className="grid gap-2 max-lg:hidden" aria-label="Squares" aria-busy={isGenerating}>
          {visiblePrompts.map((prompt, index) => (
            <li key={index} className="flex items-center gap-2">
              <SquareNumber number={index + 1} active={index === activeIndex} />
              <Input
                id={squareId(index)}
                value={prompt}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex((current) => (current === index ? null : current))}
                onChange={(event) =>
                  setPrompts((current) => current.with(index, event.target.value))
                }
                placeholder={isGenerating ? "Writing…" : "Has run a marathon"}
                // Fields lock and pulse one after another while a draft is on its way.
                disabled={isGenerating}
                className={cn(isGenerating && "animate-pulse motion-reduce:animate-none")}
                style={isGenerating ? { animationDelay: `${index * 80}ms` } : undefined}
                aria-label={`Square ${index + 1}`}
                maxLength={MAX_PROMPT_LENGTH}
                autoComplete="off"
              />
            </li>
          ))}
        </ol>

        {error && <FieldError>{error}</FieldError>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy}>
            {isSaving ? "Saving…" : board ? "Save changes" : "Create board"}
          </Button>
          <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {filledCount} of {promptCount} squares filled
            {board && ". Saving starts everyone on a fresh card."}
          </p>
        </div>
      </FieldGroup>

      <SquareDialog
        fieldId={dialogFieldId}
        // Resizing the board can leave the open square off the end of it.
        index={dialogIndex !== null && dialogIndex < promptCount ? dialogIndex : null}
        count={promptCount}
        value={dialogIndex === null ? "" : (visiblePrompts[dialogIndex] ?? "")}
        onChange={(value) => {
          if (dialogIndex !== null) setPrompts((current) => current.with(dialogIndex, value));
        }}
        onNavigate={selectSquare}
        onClose={() => setDialogIndex(null)}
      />

      <AlertDialog open={confirmingDraft} onOpenChange={setConfirmingDraft}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your squares?</AlertDialogTitle>
            <AlertDialogDescription>
              {filledCount === 1
                ? "1 square already has text."
                : `${filledCount} squares already have text.`}{" "}
              A new draft overwrites them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep them</AlertDialogCancel>
            <AlertDialogAction onClick={generate}>Draft new squares</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnsavedChangesDialog when={snapshot !== savedSnapshot} />
    </form>
  );
}
