"use client";

import { useMemo } from "react";

type CellWithChecked = {
  checked: boolean;
};

export type BingoLine = {
  type: "row" | "column" | "diagonal";
  index: number;
  cells: number[];
};

// Define all possible winning lines
const WINNING_LINES: BingoLine[] = [
  // Rows
  { type: "row", index: 0, cells: [0, 1, 2, 3, 4] },
  { type: "row", index: 1, cells: [5, 6, 7, 8, 9] },
  { type: "row", index: 2, cells: [10, 11, 12, 13, 14] },
  { type: "row", index: 3, cells: [15, 16, 17, 18, 19] },
  { type: "row", index: 4, cells: [20, 21, 22, 23, 24] },
  // Columns
  { type: "column", index: 0, cells: [0, 5, 10, 15, 20] },
  { type: "column", index: 1, cells: [1, 6, 11, 16, 21] },
  { type: "column", index: 2, cells: [2, 7, 12, 17, 22] },
  { type: "column", index: 3, cells: [3, 8, 13, 18, 23] },
  { type: "column", index: 4, cells: [4, 9, 14, 19, 24] },
  // Diagonals
  { type: "diagonal", index: 0, cells: [0, 6, 12, 18, 24] },
  { type: "diagonal", index: 1, cells: [4, 8, 12, 16, 20] },
];

export function useBingoDetection(cells: CellWithChecked[]) {
  const completedLines = useMemo(() => {
    return WINNING_LINES.filter((line) =>
      line.cells.every((cellIndex) => cells[cellIndex]?.checked)
    );
  }, [cells]);

  const winningCells = useMemo(() => {
    const winning = new Set<number>();
    completedLines.forEach((line) => {
      line.cells.forEach((cellIndex) => winning.add(cellIndex));
    });
    return winning;
  }, [completedLines]);

  const hasBingo = completedLines.length > 0;

  return {
    completedLines,
    winningCells,
    hasBingo,
  };
}

