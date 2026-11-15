import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BingoBoard } from "@/components/bingo-board";
import { PageContainer } from "@/components/page-container";
import { ShareButton } from "@/components/share-button";
import { getBoardBySlug } from "@/lib/boards";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  return {
    title: board?.title ?? "Board not found",
    description: board ? `Play “${board.title}” on Human Bingo.` : undefined,
    // Boards are unlisted: reachable by link, never indexed.
    robots: { index: false, follow: false },
  };
}

export default async function BoardPage({ params }: Props) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  return (
    <PageContainer
      title={board.title}
      description="Find someone who fits a square and write their name on it."
      actions={<ShareButton path={`/b/${board.slug}`} title={board.title} />}
    >
      <BingoBoard
        board={board}
        // Editing a board changes updatedAt, which starts players on a fresh card.
        storageKey={`${board.slug}:${board.updatedAt}`}
      />
      <p className="text-sm text-pretty text-muted-foreground">
        Each person only counts once. Finish a row, column or diagonal, then shout bingo.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Made with{" "}
        <Link href="/" className="font-medium text-foreground underline underline-offset-4">
          Human Bingo
        </Link>
        . Make your own card in a minute.
      </p>
    </PageContainer>
  );
}
