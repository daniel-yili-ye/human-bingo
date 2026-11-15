import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardEditor } from "@/components/board-editor";
import { PageContainer } from "@/components/page-container";
import { requireUser } from "@/lib/auth";
import { getOwnBoard } from "@/lib/boards";

export const metadata: Metadata = { title: "Edit board" };

export default async function EditBoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireUser(`/boards/${slug}/edit`);

  const board = await getOwnBoard(slug);
  if (!board) notFound();

  return (
    <PageContainer wide title="Edit board" description={board.title}>
      <BoardEditor board={board} />
    </PageContainer>
  );
}
