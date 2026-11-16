"use client";

import { CalendarIcon, SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MAX_TITLE_LENGTH } from "@/lib/board";
import { formatIsoDate, parseIsoDate, toIsoDate } from "@/lib/dates";

export type BoardFilterValues = {
  search: string;
  /** Inclusive created-date range, as YYYY-MM-DD or empty. */
  from: string;
  to: string;
};

const serialize = (values: BoardFilterValues) => [values.search, values.from, values.to].join("\n");

function rangeLabel({ from, to }: BoardFilterValues): string {
  if (!from) return to ? `Until ${formatIsoDate(to)}` : "Any date";
  if (!to) return `From ${formatIsoDate(from)}`;
  return from === to ? formatIsoDate(from) : `${formatIsoDate(from)} – ${formatIsoDate(to)}`;
}

/** Search and date range for the boards list. The filters live in the URL. */
export function BoardFilters({ applied }: { applied: BoardFilterValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(applied);
  // The filters this component last asked the URL to show.
  const [requested, setRequested] = useState(serialize(applied));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The URL changed from outside (back button, a link): show what it says.
  if (!pending && serialize(applied) !== requested) {
    setRequested(serialize(applied));
    setValues(applied);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const apply = (next: BoardFilterValues, delay: number) => {
    setValues(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const clean = { ...next, search: next.search.trim() };
      const params = new URLSearchParams();
      if (clean.search) params.set("q", clean.search);
      if (clean.from) params.set("from", clean.from);
      if (clean.to) params.set("to", clean.to);
      // Days are the viewer's local days; the server needs the zone to match.
      if (clean.from || clean.to) {
        params.set("tz", Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
      const query = params.toString();
      setRequested(serialize(clean));
      startTransition(() =>
        router.replace(query ? `/boards?${query}` : "/boards", { scroll: false }),
      );
    }, delay);
  };

  const range = {
    from: parseIsoDate(values.from) ?? undefined,
    to: parseIsoDate(values.to) ?? undefined,
  };
  const active = values.search || values.from || values.to;

  return (
    <div className="space-y-3" aria-busy={pending}>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Search boards by title"
          placeholder="Search boards"
          maxLength={MAX_TITLE_LENGTH}
          value={values.search}
          onChange={(event) => apply({ ...values, search: event.target.value }, 300)}
        />
      </InputGroup>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "min-w-0 flex-1 justify-start font-normal",
                !values.from && !values.to && "text-muted-foreground",
              )}
            >
              <CalendarIcon data-icon="inline-start" />
              <span className="truncate">{rangeLabel(values)}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              autoFocus
              defaultMonth={range.from}
              selected={range}
              onSelect={(next) =>
                apply(
                  {
                    ...values,
                    from: next?.from ? toIsoDate(next.from) : "",
                    to: next?.to ? toIsoDate(next.to) : "",
                  },
                  300,
                )
              }
            />
          </PopoverContent>
        </Popover>
        {active && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => apply({ search: "", from: "", to: "" }, 0)}
          >
            <XIcon data-icon="inline-start" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
