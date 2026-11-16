"use client";

import { LinkIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteBoard } from "@/actions/boards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyText } from "@/lib/clipboard";

export function BoardRowMenu({ slug, title }: { slug: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () =>
    startTransition(async () => {
      const result = await deleteBoard(slug);
      if (result.ok) toast.success("Board deleted");
      else toast.error(result.error);
      setConfirming(false);
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Sits above the row's full-size link. */}
          <Button
            variant="ghost"
            size="icon"
            className="relative z-10"
            aria-label={`Actions for ${title}`}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/boards/${slug}/edit`}>
              <PencilIcon />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => copyText(`${window.location.origin}/b/${slug}`, "Link copied")}
          >
            <LinkIcon />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirming(true)}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The share link will stop working for everyone. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(event) => {
                // Keep the dialog open until the delete finishes.
                event.preventDefault();
                handleDelete();
              }}
            >
              {pending ? "Deleting…" : "Delete board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
