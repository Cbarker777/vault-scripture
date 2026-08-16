import { describe, expect, it } from "vitest";
import { firstIncompletePlanDay } from "./progress";
import type { Plan } from "./types";

const plan: Plan = {
  id: "test-plan",
  name: "Test Plan",
  days: [
    { day: 1, readings: [{ bookId: "gen", chapter: 1 }] },
    { day: 2, readings: [{ bookId: "gen", chapter: 2 }, { bookId: "gen", chapter: 3 }] },
    { day: 3, readings: [{ bookId: "gen", chapter: 4 }] },
  ],
};

describe("firstIncompletePlanDay", () => {
  it("returns day 1 when nothing has been read", () => {
    expect(firstIncompletePlanDay(plan, new Set())).toBe(1);
  });

  it("advances to the next day once the current day's readings are all read", () => {
    const readSet = new Set(["gen:1"]);
    expect(firstIncompletePlanDay(plan, readSet)).toBe(2);
  });

  it("stays on a day until every reading in it is read", () => {
    const readSet = new Set(["gen:1", "gen:2"]);
    expect(firstIncompletePlanDay(plan, readSet)).toBe(2);
  });

  it("honors gaps rather than jumping to the last read day", () => {
    const readSet = new Set(["gen:1", "gen:4"]);
    expect(firstIncompletePlanDay(plan, readSet)).toBe(2);
  });

  it("falls back to the last day once the whole plan is read", () => {
    const readSet = new Set(["gen:1", "gen:2", "gen:3", "gen:4"]);
    expect(firstIncompletePlanDay(plan, readSet)).toBe(3);
  });
});
