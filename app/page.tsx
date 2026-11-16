import {
  ArrowRightIcon,
  LayoutGridIcon,
  type LucideIcon,
  MegaphoneIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { BingoBoard } from "@/components/bingo-board";
import { Button } from "@/components/ui/button";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: LayoutGridIcon,
    title: "Build",
    body: "Pick a size from 3 × 3 to 6 × 6. Write the squares yourself, or describe your group and let AI draft them.",
  },
  {
    icon: SendIcon,
    title: "Share",
    body: "Send one link. Everyone opens the card on their phone, no app or account needed.",
  },
  {
    icon: UsersIcon,
    title: "Mingle",
    body: "Find someone who fits a square and write their name on it. Each person only counts once.",
  },
  {
    icon: MegaphoneIcon,
    title: "Shout",
    body: "Finish a row, column or diagonal, then yell bingo loud enough for the whole room.",
  },
];

const DEMO_BOARD = {
  rows: 3,
  cols: 3,
  freeSpace: true,
  prompts: [
    "Has a pet",
    "Speaks three languages",
    "Is left-handed",
    "Plays an instrument",
    "",
    "Has run a marathon",
    "Was born abroad",
    "Drinks coffee black",
    "Has met a celebrity",
  ],
};

export default function HomePage() {
  return (
    <>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-28">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Bingo where every square is a{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-2 inset-y-0 -rotate-2 rounded-[46%_54%_50%_50%/60%_44%_56%_40%] bg-dauber/25"
                />
                <span className="relative">person.</span>
              </span>
            </h1>
            <p className="max-w-md text-lg text-pretty text-muted-foreground">
              Make an icebreaker card in a minute and share one link. To win, people have to
              actually go and talk to each other.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-11 px-5 text-base">
                <Link href="/new">
                  Make a board
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">Free. Players don&apos;t need an account.</p>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-sm rounded-2xl border bg-card p-5 shadow-sm">
              <p className="font-medium">Try it</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Write any name on two squares in line with the star.
              </p>
              <BingoBoard board={DEMO_BOARD} storageKey="demo" />
            </div>
          </div>
        </section>

        <section aria-labelledby="how-it-works" className="border-t py-16">
          <h2
            id="how-it-works"
            className="text-sm font-medium tracking-wide text-muted-foreground uppercase"
          >
            How it works
          </h2>
          <ol className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border bg-card">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="text-pretty text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          <p>Human Bingo</p>
        </div>
      </footer>
    </>
  );
}
