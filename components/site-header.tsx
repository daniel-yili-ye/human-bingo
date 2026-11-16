import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { getUser } from "@/lib/auth";

async function AccountNav() {
  const user = await getUser();

  if (!user) {
    return (
      <Button asChild size="sm">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <>
      <UserMenu label={user.name ?? user.email ?? "Account"} avatarUrl={user.avatarUrl} />
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-(--page-max) items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          <ThemeToggle />
          {/* The session is read per request; the rest of the header is static. */}
          <Suspense fallback={<Skeleton className="h-7 w-20" />}>
            <AccountNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
