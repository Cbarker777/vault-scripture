import { describe, expect, it } from "vitest";
import type { ReadingSession } from "../session/types";
import { deriveLevel, deriveStats, deriveTotalXp } from "./profile";
import { chaptersPerStatPoint } from "./stats";

function session(overrides: Partial<ReadingSession>): ReadingSession {
  return {
    id: crypto.randomUUID(),
    bookId: "gen",
    chapter: 1,
    startedAt: "2026-01-01T00:00:00.000Z",
    endedAt: "2026-01-01T00:00:00.000Z",
    dwellSeconds: 60,
    reflection: null,
    comprehensionPassed: null,
    xpAwarded: 0,
    verified: false,
    ...overrides,
  };
}

describe("deriveTotalXp", () => {
  it("sums xpAwarded across every session, regardless of verification", () => {
    const sessions = [
      session({ xpAwarded: 10, verified: true }),
      session({ xpAwarded: 0, verified: false }),
      session({ xpAwarded: 25, verified: true }),
    ];
    expect(deriveTotalXp(sessions)).toBe(35);
  });

  it("is 0 for no sessions", () => {
    expect(deriveTotalXp([])).toBe(0);
  });
});

describe("deriveLevel", () => {
  it("starts at level 1 with no XP", () => {
    expect(deriveLevel([])).toBe(1);
  });

  it("reaches level 2 once total XP crosses 100", () => {
    expect(deriveLevel([session({ xpAwarded: 99 })])).toBe(1);
    expect(deriveLevel([session({ xpAwarded: 100 })])).toBe(2);
  });
});

describe("deriveStats", () => {
  it("gives every stat a value of 1 with no sessions", () => {
    const stats = deriveStats([]);
    expect(Object.values(stats)).toEqual([1, 1, 1, 1, 1, 1]);
  });

  it("raises the correct stat for a book's genre, ignoring rereads", () => {
    const interval = chaptersPerStatPoint("Endurance"); // Law -> Endurance
    const sessions = Array.from({ length: interval }, (_, i) =>
      session({ bookId: "gen", chapter: i + 1 }),
    );
    // Reread chapter 1 again — shouldn't push the stat further.
    sessions.push(session({ bookId: "gen", chapter: 1 }));

    const stats = deriveStats(sessions);
    expect(stats.Endurance).toBe(2);
    expect(stats.Valor).toBe(1); // untouched genre stays at the floor
  });

  it("counts unverified sessions toward stats too", () => {
    const interval = chaptersPerStatPoint("Witness"); // Gospel -> Witness
    const sessions = Array.from({ length: interval }, (_, i) =>
      session({ bookId: "mat", chapter: i + 1, verified: false }),
    );
    expect(deriveStats(sessions).Witness).toBe(2);
  });
});
