"use client";

import { CopyIcon, LinkIcon, SendIcon, Share2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { copyText } from "@/lib/clipboard";

type ShareDialogProps = { slug: string; title: string };

const subscribe = () => () => {};

export function ShareDialog({ slug, title }: ShareDialogProps) {
  // A new board lands here with ?share=1, so its maker sees the link at once.
  const [open, setOpen] = useState(useSearchParams().get("share") === "1");

  // Browser-only values, read without a hydration mismatch.
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
  const canNativeShare = useSyncExternalStore(
    subscribe,
    () => typeof navigator.share === "function",
    () => false,
  );

  const url = `${origin}/b/${slug}`;
  const message = `Play “${title}” on Human Bingo:\n${url}`;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Drop ?share=1 so a refresh doesn't reopen the dialog.
    if (!next && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: message });
    } catch (error) {
      // AbortError means the person closed the share sheet.
      if ((error as Error).name !== "AbortError") {
        await copyText(message, "Message copied");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Share2Icon data-icon="inline-start" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this board</DialogTitle>
          <DialogDescription>
            Anyone with the link can play on their own card. No account needed.
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-lg border bg-muted/50 p-3 text-sm break-words whitespace-pre-wrap">
          {message}
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={() => copyText(message, "Message copied")}>
            <CopyIcon data-icon="inline-start" />
            Copy message
          </Button>
          <Button variant="outline" onClick={() => copyText(url, "Link copied")}>
            <LinkIcon data-icon="inline-start" />
            Copy link only
          </Button>
          {canNativeShare && (
            <Button variant="outline" className="sm:col-span-2" onClick={nativeShare}>
              <SendIcon data-icon="inline-start" />
              Send with another app
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
