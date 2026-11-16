import { LayoutGridIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BoardRowMenu } from "@/components/board-row-menu";
import { GridGlyph } from "@/components/grid-glyph";
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
import { listOwnBoards } from "@/lib/boards";

export const metadata: Metadata = { title: "Your boards" };

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

function NewBoardButton({ label = "New board" }: { label?: string }) {
  return (
    <Button asChild>
      <Link href="/new">
        <PlusIcon data-icon="inline-start" />
        {label}
      </Link>
    </Button>
  );
}

export default async function BoardsPage() {
  await requireUser("/boards");
  const boards = await listOwnBoards();

  return (
    <main
      data-page="narrow"
      className="mx-auto w-full max-w-(--page-max) flex-1 px-4 pt-6 pb-16"
    >
      {boards.length === 0 ? (
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
            <NewBoardButton label="Make a board" />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">Your boards</h1>
            <NewBoardButton />
          </div>
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
                    {board.rows} × {board.cols} · {dateFormat.format(new Date(board.createdAt))}
                  </p>
                </div>
                <BoardRowMenu slug={board.slug} title={board.title} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
