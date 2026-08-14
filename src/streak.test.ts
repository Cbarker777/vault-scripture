import { describe, expect, it } from "vitest";
import { currentStreakDays } from "./streak";

function iso(y: number, m: number, d: number, h = 12): string {
  return new Date(y, m, d, h).toISOString();
}

describe("currentStreakDays", () => {
  it("is 0 when today has no session", () => {
    const today = new Date(2026, 5, 10);
    const sessions = [iso(2026, 5, 9), iso(2026, 5, 8)];
    expect(currentStreakDays(sessions, today)).toBe(0);
  });

  it("counts a single day as a streak of 1", () => {
    const today = new Date(2026, 5, 10);
    expect(currentStreakDays([iso(2026, 5, 10)], today)).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    const today = new Date(2026, 5, 10);
    const sessions = [iso(2026, 5, 10), iso(2026, 5, 9), iso(2026, 5, 8)];
    expect(currentStreakDays(sessions, today)).toBe(3);
  });

  it("stops counting at the first gap", () => {
    const today = new Date(2026, 5, 10);
    const sessions = [iso(2026, 5, 10), iso(2026, 5, 9), iso(2026, 5, 7)]; // gap on the 8th
    expect(currentStreakDays(sessions, today)).toBe(2);
  });

  it("dedupes multiple sessions on the same day", () => {
    const today = new Date(2026, 5, 10);
    const sessions = [iso(2026, 5, 10, 8), iso(2026, 5, 10, 20), iso(2026, 5, 9)];
    expect(currentStreakDays(sessions, today)).toBe(2);
  });
});
