import { describe, expect, it } from "vitest";
import { BOOKS } from "../data/bible";
import type { ReadingSession } from "../session/types";
import { getBountyForDate, isBountyComplete } from "./bounty";

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

describe("getBountyForDate", () => {
  it("returns a valid book+chapter pair", () => {
    const bounty = getBountyForDate(new Date(2026, 0, 15));
    const book = BOOKS.find((b) => b.id === bounty.bookId);
    expect(book).toBeDefined();
    expect(bounty.chapter).toBeGreaterThanOrEqual(1);
    expect(bounty.chapter).toBeLessThanOrEqual(book!.chapterCount);
  });

  it("is deterministic for the same local calendar date regardless of time of day", () => {
    const morning = new Date(2026, 5, 10, 6, 0, 0);
    const night = new Date(2026, 5, 10, 23, 45, 0);
    expect(getBountyForDate(morning)).toEqual(getBountyForDate(night));
  });

  it("changes at local midnight", () => {
    const today = getBountyForDate(new Date(2026, 5, 10));
    const tomorrow = getBountyForDate(new Date(2026, 5, 11));
    expect(today).not.toEqual(tomorrow);
  });
});

describe("isBountyComplete", () => {
  const bounty = { bookId: "gen", chapter: 3 };
  const today = new Date(2026, 5, 10, 12, 0, 0);
  const laterToday = new Date(2026, 5, 10, 8, 0, 0).toISOString();
  const yesterday = new Date(2026, 5, 9, 8, 0, 0).toISOString();

  it("is true when a session for that exact chapter was logged today", () => {
    const sessions = [session({ bookId: "gen", chapter: 3, endedAt: laterToday })];
    expect(isBountyComplete(sessions, bounty, today)).toBe(true);
  });

  it("is false when the session is for a different chapter", () => {
    const sessions = [session({ bookId: "gen", chapter: 4, endedAt: laterToday })];
    expect(isBountyComplete(sessions, bounty, today)).toBe(false);
  });

  it("is false when the matching session happened on a different day", () => {
    const sessions = [session({ bookId: "gen", chapter: 3, endedAt: yesterday })];
    expect(isBountyComplete(sessions, bounty, today)).toBe(false);
  });
});
