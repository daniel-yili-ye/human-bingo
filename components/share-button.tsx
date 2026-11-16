"use client";

import { Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";

type ShareButtonProps = {
  /** Site-relative path to share, e.g. `/b/abc123`. */
  path: string;
  title: string;
} & Pick<React.ComponentProps<typeof Button>, "variant" | "size">;

export function ShareButton({ path, title, variant = "outline", size }: ShareButtonProps) {
  async function share() {
    const url = new URL(path, window.location.origin).toString();

    // Prefer the native share sheet on phones; fall back to the clipboard.
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissing the share sheet rejects; nothing to report.
      }
      return;
    }
    await copyText(url, "Link copied");
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={share}>
      <Share2Icon data-icon="inline-start" />
      Share
    </Button>
  );
}
