import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <SearchXIcon className="size-10 text-muted-foreground" />
      <h1 className="text-2xl font-semibold tracking-tight">We couldn&apos;t find that</h1>
      <p className="max-w-sm text-muted-foreground">
        The board may have been deleted, or the link might be incomplete.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
