import { BOOKS } from "../data/bible";
import type { ReadingSession } from "../session/types";

export type Bounty = { bookId: string; chapter: number };

let flatChapters: Bounty[] | null = null;

function allChapters(): Bounty[] {
  if (!flatChapters) {
    flatChapters = BOOKS.flatMap((b) =>
      Array.from({ length: b.chapterCount }, (_, i) => ({ bookId: b.id, chapter: i + 1 })),
    );
  }
  return flatChapters;
}

function localDayIndex(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

// One assigned chapter per local calendar day, deterministic from the
// date alone (no storage needed) — expires at local midnight because the
// mapping changes with the calendar day.
export function getBountyForDate(date: Date): Bounty {
  const chapters = allChapters();
  const dayIndex = localDayIndex(date);
  const index = ((dayIndex % chapters.length) + chapters.length) % chapters.length;
  return chapters[index];
}

function isSameLocalDay(iso: string, date: Date): boolean {
  const other = new Date(iso);
  return (
    other.getFullYear() === date.getFullYear() &&
    other.getMonth() === date.getMonth() &&
    other.getDate() === date.getDate()
  );
}

export function isBountyComplete(
  sessions: ReadingSession[],
  bounty: Bounty,
  date: Date,
): boolean {
  return sessions.some(
    (s) =>
      s.bookId === bounty.bookId &&
      s.chapter === bounty.chapter &&
      isSameLocalDay(s.endedAt, date),
  );
}
