import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  PlusIcon,
  SearchXIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Loading from "@/app/loading";
import { BoardFilters } from "@/components/board-filters";
import { BoardRowMenu } from "@/components/board-row-menu";
import { GridGlyph } from "@/components/grid-glyph";
import { LocalDate } from "@/components/local-date";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { requireUser } from "@/lib/auth";
import { MAX_TITLE_LENGTH } from "@/lib/board";
import { listOwnBoards } from "@/lib/boards";
import { isTimeZone, parseIsoDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Your boards" };

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

const isoDate = (value: string) => (parseIsoDate(value) ? value : "");

async function Boards({ searchParams }: Pick<PageProps<"/boards">, "searchParams">) {
  await requireUser("/boards");

  const params = await searchParams;
  const filters = {
    search: first(params.q).trim().slice(0, MAX_TITLE_LENGTH),
    from: isoDate(first(params.from)),
    to: isoDate(first(params.to)),
  };
  const filtered = Boolean(filters.search || filters.from || filters.to);
  // The browser sends its zone with a date range, so days mean local days.
  const timeZone = isTimeZone(first(params.tz)) ? first(params.tz) : "";
  const requestedPage = Number.parseInt(first(params.page), 10);
  const { boards, total, page, pageCount } = await listOwnBoards({
    ...filters,
    timeZone: timeZone || "UTC",
    page: Number.isSafeInteger(requestedPage) ? requestedPage : 1,
  });

  const pageHref = (target: number) => ({
    pathname: "/boards",
    query: {
      ...(filters.search && { q: filters.search }),
      ...(filters.from && { from: filters.from }),
      ...(filters.to && { to: filters.to }),
      ...(timeZone && { tz: timeZone }),
      ...(target > 1 && { page: target }),
    },
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-16">
      {total === 0 && !filtered ? (
        <Empty className="mt-10 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutGridIcon />
            </EmptyMedia>
            <EmptyTitle>No boards yet</EmptyTitle>
            <EmptyDescription>
              Make one and you&apos;ll have a link to share in about a minute.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/new">
                <PlusIcon data-icon="inline-start" />
                Make a board
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">Your boards</h1>
            <Button asChild>
              <Link href="/new">
                <PlusIcon data-icon="inline-start" />
                New board
              </Link>
            </Button>
          </div>
          <BoardFilters applied={filters} />
          {boards.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>No boards match</EmptyTitle>
                <EmptyDescription>Try a different title or a wider date range.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y rounded-xl border">
              {boards.map((board) => (
                <li key={board.slug} className="relative flex items-center gap-4 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center">
                    <GridGlyph grid={board} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/b/${board.slug}`}
                      className="block truncate font-medium after:absolute after:inset-0"
                    >
                      {board.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {board.rows} × {board.cols} · <LocalDate value={board.createdAt} />
                    </p>
                  </div>
                  <BoardRowMenu slug={board.slug} title={board.title} />
                </li>
              ))}
            </ul>
          )}
          {pageCount > 1 && (
            <nav aria-label="Pages" className="flex items-center justify-between gap-4">
              <Button asChild={page > 1} variant="outline" size="sm" disabled={page <= 1}>
                {page > 1 ? (
                  <Link href={pageHref(page - 1)}>
                    <ChevronLeftIcon data-icon="inline-start" />
                    Previous
                  </Link>
                ) : (
                  <>
                    <ChevronLeftIcon data-icon="inline-start" />
                    Previous
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground tabular-nums">
                Page {page} of {pageCount} · {total} boards
              </p>
              <Button
                asChild={page < pageCount}
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
              >
                {page < pageCount ? (
                  <Link href={pageHref(page + 1)}>
                    Next
                    <ChevronRightIcon data-icon="inline-end" />
                  </Link>
                ) : (
                  <>
                    Next
                    <ChevronRightIcon data-icon="inline-end" />
                  </>
                )}
              </Button>
            </nav>
          )}
        </div>
      )}
    </main>
  );
}

export default function BoardsPage({ searchParams }: PageProps<"/boards">) {
  return (
    // A boundary inside the page, so client navigations get a fallback too.
    <Suspense fallback={<Loading layout="list" />}>
      <Boards searchParams={searchParams} />
    </Suspense>
  );
}
