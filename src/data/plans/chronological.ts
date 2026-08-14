import { BOOKS } from "../bible";
import { distributeReadings } from "./generatePlan";
import type { Plan, PlanReading } from "./types";

const DAYS = 365;

// A book-level chronological ordering (not a chapter-by-chapter harmony —
// that's a much bigger scholarly undertaking than this app needs), grouping
// whole books by their traditional historical setting or composition era.
const CHRONOLOGICAL_BOOK_ORDER = [
  // Patriarchal era through the united and divided kingdoms
  "job", "gen", "exo", "lev", "num", "deu", "jos", "jdg", "rut", "1sa", "2sa",
  "1ch", "psa", "1ki", "pro", "ecc", "sng", "2ch",
  // Prophets roughly ordered by the kingdom era they addressed
  "oba", "jol", "jon", "amo", "hos", "isa", "mic", "nam", "zep", "hab", "2ki",
  "jer", "lam", "ezk", "dan",
  // Exile and return
  "ezr", "hag", "zec", "est", "neh", "mal",
  // New Testament, roughly by composition date
  "jas", "gal", "1th", "2th", "1co", "2co", "rom", "mrk", "luk", "act", "eph",
  "php", "col", "phm", "1ti", "tit", "1pe", "heb", "mat", "2ti", "2pe", "jud",
  "jhn", "1jn", "2jn", "3jn", "rev",
] as const;

function buildReadings(): PlanReading[] {
  const chapterCounts = new Map(BOOKS.map((b) => [b.id, b.chapterCount]));
  return CHRONOLOGICAL_BOOK_ORDER.flatMap((bookId) => {
    const chapterCount = chapterCounts.get(bookId);
    if (!chapterCount) throw new Error(`Unknown book id in chronological order: ${bookId}`);
    return Array.from({ length: chapterCount }, (_, i) => ({ bookId, chapter: i + 1 }));
  });
}

export const chronologicalPlan: Plan = {
  id: "chronological",
  name: "Chronological",
  days: distributeReadings(buildReadings(), DAYS),
};
