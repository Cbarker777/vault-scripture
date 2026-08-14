import { BOOKS } from "../bible";
import { distributeReadings } from "./generatePlan";
import type { Plan, PlanReading } from "./types";

function chapterCount(bookId: string): number {
  const book = BOOKS.find((b) => b.id === bookId);
  if (!book) throw new Error(`Unknown book id: ${bookId}`);
  return book.chapterCount;
}

// A repeating cycle sized to Proverbs' chapter count, so each day reads
// the Proverbs chapter matching that day of the cycle plus an even slice
// of Psalms, cycling through all 150 psalms once per pass.
function buildPlan(): Plan {
  const cycleDays = chapterCount("pro");
  const psalmsReadings: PlanReading[] = Array.from(
    { length: chapterCount("psa") },
    (_, i) => ({ bookId: "psa", chapter: i + 1 }),
  );
  const psalmsDays = distributeReadings(psalmsReadings, cycleDays);

  return {
    id: "psalms-proverbs-daily",
    name: "Psalms & Proverbs Daily",
    days: psalmsDays.map((pd) => ({
      day: pd.day,
      readings: [...pd.readings, { bookId: "pro", chapter: pd.day }],
    })),
  };
}

export const psalmsProverbsDailyPlan: Plan = buildPlan();
