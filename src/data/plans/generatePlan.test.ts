import { describe, expect, it } from "vitest";
import { distributeReadings } from "./generatePlan";
import type { PlanReading } from "./types";

function readings(count: number): PlanReading[] {
  return Array.from({ length: count }, (_, i) => ({ bookId: "gen", chapter: i + 1 }));
}

describe("distributeReadings", () => {
  it("preserves every reading, in order, across all days", () => {
    const days = distributeReadings(readings(10), 3);
    const flattened = days.flatMap((d) => d.readings);
    expect(flattened).toEqual(readings(10));
  });

  it("produces exactly dayCount days, numbered from 1", () => {
    const days = distributeReadings(readings(10), 4);
    expect(days.map((d) => d.day)).toEqual([1, 2, 3, 4]);
  });

  it("keeps day sizes within one of each other", () => {
    const days = distributeReadings(readings(1189), 365);
    const sizes = days.map((d) => d.readings.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(1189);
  });

  it("distributes evenly when the count divides cleanly", () => {
    const days = distributeReadings(readings(90), 90);
    expect(days.every((d) => d.readings.length === 1)).toBe(true);
  });

  it("gives every day at least one reading when there are fewer days than readings", () => {
    const days = distributeReadings(readings(5), 5);
    expect(days.every((d) => d.readings.length >= 1)).toBe(true);
  });
});
