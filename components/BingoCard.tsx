"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BingoCell } from "@/components/BingoCell";
import { useLocalBingoStorage } from "@/hooks/useLocalBingoStorage";
import { useBingoDetection } from "@/hooks/useBingoDetection";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { BingoCardData } from "@/data/bingoCards";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

type BingoCardProps = {
  cardData: BingoCardData;
};

export function BingoCard({ cardData }: BingoCardProps) {
  const { state, checkedCells, isLoaded, updateNote, resetCard } =
    useLocalBingoStorage(cardData.id);

  // Create cell state array for bingo detection
  const cellsForDetection = checkedCells.map((checked, index) => ({
    checked,
    note: state.cells[index]?.note ?? "",
  }));

  const { completedLines, winningCells, hasBingo } =
    useBingoDetection(cellsForDetection);

  // Track previous completed lines count to detect new bingos
  const prevLinesCountRef = useRef(0);

  useEffect(() => {
    if (!isLoaded) return;

    const currentCount = completedLines.length;
    const prevCount = prevLinesCountRef.current;

    // Only celebrate when we get a NEW bingo line
    if (currentCount > prevCount && currentCount > 0) {
      const latestLine = completedLines[completedLines.length - 1];
      const lineType =
        latestLine.type === "diagonal"
          ? "diagonal"
          : latestLine.type === "row"
          ? `row ${latestLine.index + 1}`
          : `column ${latestLine.index + 1}`;

      toast.success(`🎉 BINGO! You completed ${lineType}!`, {
        description: `You now have ${currentCount} bingo line${
          currentCount > 1 ? "s" : ""
        }!`,
        duration: 5000,
      });

      // Fire confetti!
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2,
          },
          colors: ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"],
        });
      }, 250);
    }

    prevLinesCountRef.current = currentCount;
  }, [completedLines, isLoaded]);

  const handleReset = () => {
    resetCard();
    prevLinesCountRef.current = 0;
    toast.info("Card reset!", {
      description: "All cells have been cleared.",
    });
  };

  if (!isLoaded) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full max-w-2xl mx-auto transition-all duration-500",
        hasBingo && "ring-2 ring-amber-500/50 shadow-xl shadow-amber-500/10"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {cardData.name}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs sm:text-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
        </div>
        {hasBingo && (
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium animate-pulse">
            🎉 You have {completedLines.length} BINGO
            {completedLines.length > 1 ? "s" : ""}!
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 grid-rows-5 gap-1 sm:gap-1.5 md:gap-2 auto-rows-fr">
          {cardData.prompts.map((prompt, index) => (
            <BingoCell
              key={index}
              prompt={prompt}
              checked={checkedCells[index] ?? false}
              note={state.cells[index]?.note ?? ""}
              isWinning={winningCells.has(index)}
              isFreeSpace={index === 12}
              onNoteChange={(note) => updateNote(index, note)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
