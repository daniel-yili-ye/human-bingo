import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/actions/auth";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getUser, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext);
  if (await getUser()) redirect(next);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <div className="mb-8 space-y-2 text-center">
        <LogoMark className="mx-auto size-10" />
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Human Bingo</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Save your boards, edit them later and reuse them. Players never need to sign in.
        </p>
      </div>
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="outline" className="h-10 w-full">
          <GoogleMark />
          Continue with Google
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          Couldn&apos;t sign in with Google. Try again.
        </p>
      )}
    </main>
  );
}
