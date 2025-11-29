"use client";

import { useState } from "react";
import { BingoCard } from "@/components/BingoCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bingoCards, cardIds } from "@/data/bingoCards";
import { Info } from "lucide-react";

export default function Home() {
  const [activeCardId, setActiveCardId] = useState(cardIds[0]);
  const activeCard = bingoCards[activeCardId];

  return (
    <main className="min-h-screen bg-linear-to-br from-background via-background to-accent/20">
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
        </header>

        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="max-w-md w-full">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4 flex gap-3 items-start shadow-sm">
              <Info className="w-5 h-5 mt-0.5 text-blue-600 shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm sm:text-base text-blue-800">
                  How to play
                </div>
                <div className="mt-1 text-blue-700 text-xs sm:text-sm">
                  Find people who match a square and type their name to complete
                  a cell. Complete a row, column, or diagonal to win! Each
                  person's name can only appear once per Bingo card. Once you
                  have a Bingo, please shout out "BINGO" to let everyone know!
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Card Selector */}
        <Tabs
          value={activeCardId}
          onValueChange={setActiveCardId}
          className="flex flex-col items-center mb-6 sm:mb-8"
        >
          <TabsList className="h-auto gap-1 p-1">
            {cardIds.map((cardId) => {
              const card = bingoCards[cardId];
              return (
                <TabsTrigger
                  key={cardId}
                  value={cardId}
                  className="w-full px-6 py-2 text-sm data-[state=active]:shadow-md"
                >
                  {card.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Bingo Card */}
        <BingoCard cardData={activeCard} />
      </div>
    </main>
  );
}
