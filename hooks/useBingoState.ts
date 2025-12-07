"use client";

import { useState, useCallback, useMemo } from "react";
import { cardIds } from "@/data/bingoCards";

export type CellState = {
  note: string;
};

export type BingoState = {
  cells: CellState[];
};

export type AllCardsState = Record<string, BingoState>;

const FREE_SPACE_INDEX = 12;

const getInitialCardState = (): BingoState => ({
  cells: Array(25)
    .fill(null)
    .map(() => ({
      note: "",
    })),
});

// Initialize state for all cards
const getInitialAllCardsState = (): AllCardsState => {
  const state: AllCardsState = {};
  for (const cardId of cardIds) {
    state[cardId] = getInitialCardState();
  }
  return state;
};

export function useBingoState() {
  const [allCardsState, setAllCardsState] = useState<AllCardsState>(getInitialAllCardsState);

  const updateNote = useCallback((cardId: string, index: number, note: string) => {
    setAllCardsState((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        cells: prev[cardId].cells.map((cell, i) =>
          i === index ? { ...cell, note } : cell
        ),
      },
    }));
  }, []);

  const resetCard = useCallback((cardId: string) => {
    setAllCardsState((prev) => ({
      ...prev,
      [cardId]: getInitialCardState(),
    }));
  }, []);

  const getCheckedCells = useCallback((cardId: string) => {
    const cardState = allCardsState[cardId] ?? getInitialCardState();
    return cardState.cells.map((cell, index) => {
      if (index === FREE_SPACE_INDEX) return true;
      return cell.note.trim().length > 0;
    });
  }, [allCardsState]);

  const getCardState = useCallback((cardId: string) => {
    return allCardsState[cardId] ?? getInitialCardState();
  }, [allCardsState]);

  return {
    allCardsState,
    getCardState,
    getCheckedCells,
    updateNote,
    resetCard,
  };
}

