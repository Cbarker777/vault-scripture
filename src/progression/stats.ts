import { BOOKS } from "../data/bible";
import type { BookGenre } from "../data/bible/types";

export type StatId = "Endurance" | "Valor" | "Insight" | "Vision" | "Witness" | "Charity";

export const GENRE_TO_STAT: Record<BookGenre, StatId> = {
  Law: "Endurance",
  History: "Valor",
  Wisdom: "Insight",
  Prophecy: "Vision",
  Gospel: "Witness",
  Epistle: "Charity",
};

const STAT_TO_GENRE = Object.fromEntries(
  (Object.entries(GENRE_TO_STAT) as [BookGenre, StatId][]).map(([genre, stat]) => [
    stat,
    genre,
  ]),
) as Record<StatId, BookGenre>;

const STAT_MIN = 1;
const STAT_MAX = 10;
const STEPS_TO_MAX = STAT_MAX - STAT_MIN;

function totalChaptersForGenre(genre: BookGenre): number {
  return BOOKS.filter((b) => b.genre === genre).reduce((sum, b) => sum + b.chapterCount, 0);
}

// Chapters of this stat's genre needed per +1 point, derived from the real
// chapter counts so that maxing the stat takes roughly the whole genre.
export function chaptersPerStatPoint(stat: StatId): number {
  const total = totalChaptersForGenre(STAT_TO_GENRE[stat]);
  return Math.max(1, Math.round(total / STEPS_TO_MAX));
}

export function statValue(stat: StatId, distinctChaptersReadInGenre: number): number {
  const interval = chaptersPerStatPoint(stat);
  const value = STAT_MIN + Math.floor(distinctChaptersReadInGenre / interval);
  return Math.min(STAT_MAX, value);
}
