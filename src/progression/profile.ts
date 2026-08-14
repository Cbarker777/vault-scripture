import { BOOKS } from "../data/bible";
import type { ReadingSession } from "../session/types";
import { levelForXp } from "./level";
import { GENRE_TO_STAT, statValue, type StatId } from "./stats";

// Level, XP, and stats are all derived from session history rather than
// stored separately — a session's xpAwarded is fixed at log time, so
// summing it is always the true lifetime total, and it can never drift
// out of sync with the archive (same pattern as quests).
export function deriveTotalXp(sessions: ReadingSession[]): number {
  return sessions.reduce((sum, s) => sum + s.xpAwarded, 0);
}

export function deriveLevel(sessions: ReadingSession[]): number {
  return levelForXp(deriveTotalXp(sessions));
}

export function deriveStats(sessions: ReadingSession[]): Record<StatId, number> {
  const genreByBook = new Map(BOOKS.map((b) => [b.id, b.genre]));
  const chaptersReadByStat = new Map<StatId, Set<string>>();

  for (const session of sessions) {
    const genre = genreByBook.get(session.bookId);
    if (!genre) continue;
    const stat = GENRE_TO_STAT[genre];
    let read = chaptersReadByStat.get(stat);
    if (!read) {
      read = new Set();
      chaptersReadByStat.set(stat, read);
    }
    read.add(`${session.bookId}:${session.chapter}`);
  }

  const stats = {} as Record<StatId, number>;
  for (const stat of Object.values(GENRE_TO_STAT)) {
    stats[stat] = statValue(stat, chaptersReadByStat.get(stat)?.size ?? 0);
  }
  return stats;
}
