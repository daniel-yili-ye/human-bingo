"use client";

import { useState } from "react";
import { BingoCard } from "@/components/BingoCard";
import { Button } from "@/components/ui/button";
import { bingoCards, cardIds } from "@/data/bingoCards";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeCardId, setActiveCardId] = useState(cardIds[0]);
  const activeCard = bingoCards[activeCardId];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            <span className="bg-linear-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Human
            </span>{" "}
            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Bingo
            </span>
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Find people who match each square. Type their name and click to mark
            complete!
          </p>
        </header>

        {/* Card Selector */}
        <nav className="flex flex-col items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {cardIds.map((cardId) => {
            const card = bingoCards[cardId];
            const isActive = cardId === activeCardId;
            return (
              <Button
                key={cardId}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCardId(cardId)}
                className={cn(
                  "transition-all duration-300",
                  isActive
                    ? "shadow-lg shadow-primary/25 scale-105"
                    : "hover:scale-105"
                )}
              >
                {card.name}
              </Button>
            );
          })}
        </nav>

        {/* Bingo Card */}
        <BingoCard cardData={activeCard} />

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete a row, column, or diagonal to win! Your progress is saved
            automatically.
          </p>
        </footer>
      </div>
    </main>
  );
}
