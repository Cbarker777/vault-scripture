import { describe, expect, it } from "vitest";
import { isNightShiftHours } from "./nightShift";

describe("isNightShiftHours", () => {
  it("is true at 22:00 and later", () => {
    expect(isNightShiftHours(new Date(2026, 0, 1, 22, 0))).toBe(true);
    expect(isNightShiftHours(new Date(2026, 0, 1, 23, 59))).toBe(true);
  });

  it("is true before 05:00", () => {
    expect(isNightShiftHours(new Date(2026, 0, 1, 0, 0))).toBe(true);
    expect(isNightShiftHours(new Date(2026, 0, 1, 4, 59))).toBe(true);
  });

  it("is false during the day", () => {
    expect(isNightShiftHours(new Date(2026, 0, 1, 5, 0))).toBe(false);
    expect(isNightShiftHours(new Date(2026, 0, 1, 12, 0))).toBe(false);
    expect(isNightShiftHours(new Date(2026, 0, 1, 21, 59))).toBe(false);
  });
});
