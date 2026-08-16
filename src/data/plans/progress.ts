import type { Plan } from "./types";

// The first day with at least one unread reading, honoring gaps — mirrors
// firstUnreadChapter's questline logic. Falls back to the last day once
// every reading in the plan has been read at least once, so a finished
// plan doesn't snap back to day 1.
export function firstIncompletePlanDay(plan: Plan, readSet: Set<string>): number {
  for (const day of plan.days) {
    const allRead = day.readings.every((r) => readSet.has(`${r.bookId}:${r.chapter}`));
    if (!allRead) return day.day;
  }
  return plan.days[plan.days.length - 1]?.day ?? 1;
}
