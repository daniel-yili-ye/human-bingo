import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      data-page="narrow"
      className="mx-auto w-full max-w-(--page-max) flex-1 space-y-6 px-4 pt-6 pb-16"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="aspect-square w-full rounded-xl" />
    </main>
  );
}
