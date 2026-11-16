"use client";

import { SparklesIcon } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { createBoard, generatePrompts, updateBoard } from "@/actions/boards";
import { BoardPreview, SquareNumber } from "@/components/board-preview";
import { GridGlyph } from "@/components/grid-glyph";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
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

/** Create form when `board` is omitted, edit form otherwise. */
export function BoardEditor({ board }: { board?: Board }) {
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
    <form onSubmit={save} noValidate className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
      <FieldGroup>
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

      {/* Sits between settings and squares on phones; pinned alongside on desktop. */}
      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="lg:sticky lg:top-20">
          <BoardPreview
            title={title}
            cols={cols}
            cells={cells}
            prompts={visiblePrompts}
            activeIndex={activeIndex}
            onSelect={(index) => document.getElementById(squareId(index))?.focus()}
          />
        </div>
      </div>

      <FieldGroup className="lg:col-start-1">
        <FieldSeparator className="max-lg:hidden" />

        <FieldSet>
          <FieldLegend>Squares</FieldLegend>
          <FieldDescription>
            Something a person in the room could be or have done. One per square.
          </FieldDescription>

          <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
            <FieldLabel htmlFor={`${id}-topic`}>Draft them with AI</FieldLabel>
            <Textarea
              id={`${id}-topic`}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Welcome night for new engineering interns who love board games"
              maxLength={MAX_TOPIC_LENGTH}
              rows={2}
              className="bg-background"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {filledCount > 0
                  ? "Replaces the squares below."
                  : "Describe your group or event. You can edit the results."}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={generate}
                disabled={busy || topic.trim().length < 3}
              >
                <SparklesIcon data-icon="inline-start" />
                {isGenerating ? "Drafting…" : `Draft ${promptCount} squares`}
              </Button>
            </div>
          </div>

          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
                  placeholder="Has run a marathon"
                  aria-label={`Square ${index + 1}`}
                  maxLength={MAX_PROMPT_LENGTH}
                  autoComplete="off"
                />
              </li>
            ))}
          </ol>
        </FieldSet>

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
    </form>
  );
}
