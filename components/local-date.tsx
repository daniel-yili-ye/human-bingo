"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const local = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const utc = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

/**
 * A timestamp as a date in the viewer's time zone. The server cannot know
 * that zone, so it renders the UTC date and the browser corrects it.
 */
export function LocalDate({ value }: { value: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => local.format(new Date(value)),
    () => utc.format(new Date(value)),
  );
  return <time dateTime={value}>{text}</time>;
}
