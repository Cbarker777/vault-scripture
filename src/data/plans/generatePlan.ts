import type { PlanDay, PlanReading } from "./types";

// Spreads readings across dayCount days as evenly as possible, preserving
// order, by always taking ceil(remaining / remainingDays) for the current
// day. Keeps every day's count within one of its neighbors.
export function distributeReadings(readings: PlanReading[], dayCount: number): PlanDay[] {
  const days: PlanDay[] = [];
  let cursor = 0;

  for (let day = 1; day <= dayCount; day++) {
    const remainingDays = dayCount - day + 1;
    const remainingReadings = readings.length - cursor;
    const count = Math.ceil(remainingReadings / remainingDays);
    days.push({ day, readings: readings.slice(cursor, cursor + count) });
    cursor += count;
  }

  return days;
}
