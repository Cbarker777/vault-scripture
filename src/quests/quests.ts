import { BOOKS } from "../data/bible";
import type { ReadingSession } from "../session/types";
import type { Quest } from "./types";

// Questline = one book. Progress is every distinct chapter read at least
// once (verified or not, per CLAUDE.md §6 — history/quest progress
// doesn't require verification, only XP does). Derived entirely from
// logged sessions rather than stored separately, so it can never drift
// out of sync with the archive.
export function deriveQuests(sessions: ReadingSession[]): Quest[] {
  const totalByBook = new Map(BOOKS.map((b) => [b.id, b.chapterCount]));
  const chaptersReadByBook = new Map<string, Set<number>>();
  const completedAtByBook = new Map<string, string>();

  const chronological = [...sessions].sort(
    (a, b) => new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime(),
  );

  for (const session of chronological) {
    const total = totalByBook.get(session.bookId);
    if (total === undefined) continue;

    let read = chaptersReadByBook.get(session.bookId);
    if (!read) {
      read = new Set();
      chaptersReadByBook.set(session.bookId, read);
    }
    read.add(session.chapter);

    if (!completedAtByBook.has(session.bookId) && read.size >= total) {
      completedAtByBook.set(session.bookId, session.endedAt);
    }
  }

  return BOOKS.map((b) => ({
    bookId: b.id,
    chaptersRead: Array.from(chaptersReadByBook.get(b.id) ?? []).sort((x, y) => x - y),
    completedAt: completedAtByBook.get(b.id) ?? null,
  }));
}
