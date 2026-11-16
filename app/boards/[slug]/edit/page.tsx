import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Loading from "@/app/loading";
import { BoardEditor } from "@/components/board-editor";
import { PageContainer } from "@/components/page-container";
import { requireUser } from "@/lib/auth";
import { getOwnBoard } from "@/lib/boards";

export const metadata: Metadata = { title: "Edit board" };

type Props = { params: Promise<{ slug: string }> };

async function EditBoard({ params }: Props) {
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

export default function EditBoardPage({ params }: Props) {
  return (
    // A boundary inside the page, so client navigations get a fallback too.
    <Suspense fallback={<Loading layout="editor" />}>
      <EditBoard params={params} />
    </Suspense>
  );
}
