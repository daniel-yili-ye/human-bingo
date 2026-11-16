"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const PREFIX = "human-bingo:progress:";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keeps other tabs showing the same board in sync.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Storage can throw (private browsing, quota, blocked site data); the board
// must still be playable, so every access degrades to in-memory behaviour.
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    if (value === null) memory.delete(key);
    else memory.set(key, value);
  }
  for (const listener of listeners) listener();
}

function parse(raw: string | null, cellCount: number): string[] {
  const empty = Array<string>(cellCount).fill("");
  if (!raw) return empty;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return empty;
    return empty.map((_, i) => (typeof value[i] === "string" ? value[i] : ""));
  } catch {
    return empty;
  }
}

/**
 * Names typed into a board, persisted on this device.
 *
 * Uses `useSyncExternalStore` so the server render and hydration both see an
 * empty card (no hydration mismatch) and saved names appear right after.
 * `storageKey` should change whenever the board's content changes so stale
 * names never attach to different squares.
 */
export function useBoardProgress(storageKey: string, cellCount: number) {
  const key = PREFIX + storageKey;

  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );
  const names = useMemo(() => parse(raw, cellCount), [raw, cellCount]);

  const setName = useCallback(
    (index: number, name: string) => {
      const next = parse(read(key), cellCount);
      next[index] = name;
      write(key, JSON.stringify(next));
    },
    [key, cellCount],
  );

  const reset = useCallback(() => write(key, null), [key]);

  return { names, setName, reset };
}
