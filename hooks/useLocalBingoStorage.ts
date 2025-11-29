"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export type CellState = {
  note: string;
};

export type BingoState = {
  cells: CellState[];
};

const STORAGE_PREFIX = "human-bingo-";
const FREE_SPACE_INDEX = 12;

const getInitialState = (): BingoState => ({
  cells: Array(25)
    .fill(null)
    .map(() => ({
      note: "",
    })),
});

export function useLocalBingoStorage(cardId: string) {
  const [state, setState] = useState<BingoState>(getInitialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storageKey = `${STORAGE_PREFIX}${cardId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as BingoState;
        setState(parsed);
      } else {
        setState(getInitialState());
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      setState(getInitialState());
    }
    setIsLoaded(true);
  }, [cardId]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    const storageKey = `${STORAGE_PREFIX}${cardId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [state, cardId, isLoaded]);

  // Derive checked state from notes - cell is checked if it has a name or is free space
  const checkedCells = useMemo(() => {
    return state.cells.map((cell, index) => {
      if (index === FREE_SPACE_INDEX) return true; // Free space always checked
      return cell.note.trim().length > 0;
    });
  }, [state.cells]);

  const updateNote = useCallback((index: number, note: string) => {
    setState((prev) => ({
      ...prev,
      cells: prev.cells.map((cell, i) =>
        i === index ? { ...cell, note } : cell
      ),
    }));
  }, []);

  const resetCard = useCallback(() => {
    setState(getInitialState());
  }, []);

  return {
    state,
    checkedCells,
    isLoaded,
    updateNote,
    resetCard,
  };
}
