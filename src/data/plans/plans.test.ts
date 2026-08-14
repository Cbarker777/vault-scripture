import { describe, expect, it } from "vitest";
import { BOOKS } from "../bible";
import { chronologicalPlan } from "./chronological";
import { nt90Plan } from "./nt90";
import { psalmsProverbsDailyPlan } from "./psalmsProverbsDaily";

function chapterCount(bookId: string): number {
  return BOOKS.find((b) => b.id === bookId)!.chapterCount;
}

describe("chronologicalPlan", () => {
  it("covers every book's every chapter exactly once across 365 days", () => {
    const all = chronologicalPlan.days.flatMap((d) => d.readings);
    const totalChapters = BOOKS.reduce((sum, b) => sum + b.chapterCount, 0);
    expect(all.length).toBe(totalChapters);

    const seen = new Set(all.map((r) => `${r.bookId}:${r.chapter}`));
    expect(seen.size).toBe(totalChapters);
    for (const book of BOOKS) {
      for (let c = 1; c <= book.chapterCount; c++) {
        expect(seen.has(`${book.id}:${c}`)).toBe(true);
      }
    }
  });

  it("has exactly 365 days", () => {
    expect(chronologicalPlan.days.length).toBe(365);
  });
});

describe("nt90Plan", () => {
  it("covers only NT chapters, over 90 days", () => {
    expect(nt90Plan.days.length).toBe(90);
    const all = nt90Plan.days.flatMap((d) => d.readings);
    const ntBookIds = new Set(BOOKS.filter((b) => b.testament === "NT").map((b) => b.id));
    expect(all.every((r) => ntBookIds.has(r.bookId))).toBe(true);

    const totalNtChapters = BOOKS.filter((b) => b.testament === "NT").reduce(
      (sum, b) => sum + b.chapterCount,
      0,
    );
    expect(all.length).toBe(totalNtChapters);
  });
});

describe("psalmsProverbsDailyPlan", () => {
  it("has one day per Proverbs chapter, each pairing that Proverbs chapter with some Psalms", () => {
    expect(psalmsProverbsDailyPlan.days.length).toBe(chapterCount("pro"));
    for (const day of psalmsProverbsDailyPlan.days) {
      const proverbsReadings = day.readings.filter((r) => r.bookId === "pro");
      expect(proverbsReadings).toEqual([{ bookId: "pro", chapter: day.day }]);
      expect(day.readings.some((r) => r.bookId === "psa")).toBe(true);
    }
  });

  it("covers every psalm exactly once across the cycle", () => {
    const psalmReadings = psalmsProverbsDailyPlan.days.flatMap((d) =>
      d.readings.filter((r) => r.bookId === "psa"),
    );
    expect(psalmReadings.length).toBe(chapterCount("psa"));
    expect(new Set(psalmReadings.map((r) => r.chapter)).size).toBe(chapterCount("psa"));
  });
});
