import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { BoardEditor } from "@/components/board-editor";
import { PageContainer } from "@/components/page-container";
import { getAiUsage } from "@/lib/ai-usage";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New board" };

async function NewBoard() {
  await requireUser("/new");

  return (
    <PageContainer wide title="New board" description="Set it up once, then share one link.">
      <BoardEditor aiUsage={await getAiUsage()} />
    </PageContainer>
  );
}

export default function NewBoardPage() {
  return (
    // A boundary inside the page, so client navigations get a fallback too.
    <Suspense fallback={<Loading layout="editor" />}>
      <NewBoard />
    </Suspense>
  );
}
