"use client";

import { useState } from "react";
import { BingoCard } from "@/components/BingoCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bingoCards, cardIds } from "@/data/bingoCards";
import { useBingoState } from "@/hooks/useBingoState";

export function BingoCardSelector() {
  const [activeCardId, setActiveCardId] = useState(cardIds[0]);
  const activeCard = bingoCards[activeCardId];

  const { getCardState, getCheckedCells, updateNote, resetCard } =
    useBingoState();

  return (
    <>
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
      <BingoCard
        cardData={activeCard}
        state={getCardState(activeCardId)}
        checkedCells={getCheckedCells(activeCardId)}
        onNoteChange={(index, note) => updateNote(activeCardId, index, note)}
        onReset={() => resetCard(activeCardId)}
      />
    </>
  );
}
