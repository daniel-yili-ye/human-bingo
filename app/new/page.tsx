import type { Metadata } from "next";
import { BoardEditor } from "@/components/board-editor";
import { PageContainer } from "@/components/page-container";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New board" };

export default async function NewBoardPage() {
  await requireUser("/new");

  return (
    <PageContainer wide title="New board" description="Set it up once, then share one link.">
      <BoardEditor />
    </PageContainer>
  );
}
