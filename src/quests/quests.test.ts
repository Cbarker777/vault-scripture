import { describe, expect, it } from "vitest";
import type { ReadingSession } from "../session/types";
import { deriveQuests } from "./quests";

function session(overrides: Partial<ReadingSession>): ReadingSession {
  return {
    id: crypto.randomUUID(),
    bookId: "jud", // 1 chapter — cheap to fully complete in tests
    chapter: 1,
    startedAt: "2026-01-01T00:00:00.000Z",
    endedAt: "2026-01-01T00:05:00.000Z",
    dwellSeconds: 60,
    reflection: null,
    comprehensionPassed: null,
    xpAwarded: 0,
    verified: false,
    ...overrides,
  };
}

describe("deriveQuests", () => {
  it("returns one quest per canonical book, all untouched with no sessions", () => {
    const quests = deriveQuests([]);
    expect(quests.length).toBe(66);
    expect(quests.every((q) => q.chaptersRead.length === 0 && q.completedAt === null)).toBe(
      true,
    );
  });

  it("tracks distinct chapters read for a book, deduping repeats", () => {
    const quests = deriveQuests([
      session({ bookId: "rut", chapter: 1 }),
      session({ bookId: "rut", chapter: 1 }), // reread, shouldn't double-count
      session({ bookId: "rut", chapter: 2 }),
    ]);
    const ruth = quests.find((q) => q.bookId === "rut")!;
    expect(ruth.chaptersRead).toEqual([1, 2]);
  });

  it("counts unverified sessions toward quest progress", () => {
    const quests = deriveQuests([session({ bookId: "oba", chapter: 1, verified: false })]);
    const obadiah = quests.find((q) => q.bookId === "oba")!;
    expect(obadiah.chaptersRead).toEqual([1]);
  });

  it("marks a single-chapter book complete once its one chapter is read", () => {
    const quests = deriveQuests([
      session({ bookId: "jud", chapter: 1, endedAt: "2026-03-01T00:00:00.000Z" }),
    ]);
    const jude = quests.find((q) => q.bookId === "jud")!;
    expect(jude.completedAt).toBe("2026-03-01T00:00:00.000Z");
  });

  it("does not mark a multi-chapter book complete until every chapter is read", () => {
    const quests = deriveQuests([
      session({ bookId: "rut", chapter: 1 }),
      session({ bookId: "rut", chapter: 2 }),
      session({ bookId: "rut", chapter: 3 }),
      // Ruth has 4 chapters — chapter 4 never read
    ]);
    const ruth = quests.find((q) => q.bookId === "rut")!;
    expect(ruth.completedAt).toBeNull();
  });

  it("sets completedAt to the timestamp of the session that finished the last chapter, regardless of insertion order", () => {
    const quests = deriveQuests([
      session({ bookId: "rut", chapter: 3, endedAt: "2026-01-03T00:00:00.000Z" }),
      session({ bookId: "rut", chapter: 1, endedAt: "2026-01-01T00:00:00.000Z" }),
      session({ bookId: "rut", chapter: 4, endedAt: "2026-01-04T00:00:00.000Z" }),
      session({ bookId: "rut", chapter: 2, endedAt: "2026-01-02T00:00:00.000Z" }),
    ]);
    const ruth = quests.find((q) => q.bookId === "rut")!;
    expect(ruth.completedAt).toBe("2026-01-04T00:00:00.000Z");
  });
});
