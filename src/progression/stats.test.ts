import { describe, expect, it } from "vitest";
import { chaptersPerStatPoint, GENRE_TO_STAT, statValue, type StatId } from "./stats";

// Actual chapter counts from the ingested WEB text (66 books, 1189 chapters):
// Law 187, History 249, Wisdom 243, Prophecy 272, Gospel 117, Epistle 121.
describe("chaptersPerStatPoint", () => {
  it("derives each stat's interval from real chapter counts, not a hardcoded table", () => {
    expect(chaptersPerStatPoint("Endurance")).toBe(21); // Law: 187/9
    expect(chaptersPerStatPoint("Valor")).toBe(28); // History: 249/9
    expect(chaptersPerStatPoint("Insight")).toBe(27); // Wisdom: 243/9
    expect(chaptersPerStatPoint("Vision")).toBe(30); // Prophecy: 272/9
    expect(chaptersPerStatPoint("Witness")).toBe(13); // Gospel: 117/9
    expect(chaptersPerStatPoint("Charity")).toBe(13); // Epistle: 121/9
  });
});

describe("GENRE_TO_STAT", () => {
  it("covers all six genres with distinct stats", () => {
    const stats = Object.values(GENRE_TO_STAT);
    expect(new Set(stats).size).toBe(6);
  });
});

describe("statValue", () => {
  it("starts every stat at 1 with no chapters read", () => {
    const allStats = Object.values(GENRE_TO_STAT) as StatId[];
    for (const stat of allStats) {
      expect(statValue(stat, 0)).toBe(1);
    }
  });

  it("stays at 1 until the interval for that stat is crossed", () => {
    const interval = chaptersPerStatPoint("Endurance");
    expect(statValue("Endurance", interval - 1)).toBe(1);
    expect(statValue("Endurance", interval)).toBe(2);
  });

  it("increases by one point per interval", () => {
    const interval = chaptersPerStatPoint("Witness");
    expect(statValue("Witness", interval * 3)).toBe(4);
  });

  it("caps at 10 even if every chapter of the genre (and then some) is read", () => {
    expect(statValue("Vision", 272)).toBeLessThanOrEqual(10);
    expect(statValue("Vision", 10_000)).toBe(10);
  });

  it("reaches (or comes within one point of) the cap after reading roughly the whole genre", () => {
    const allStats = Object.values(GENRE_TO_STAT) as StatId[];
    for (const stat of allStats) {
      const interval = chaptersPerStatPoint(stat);
      const wholeGenre = interval * 9; // the exact chapter count a maxed stat implies
      expect(statValue(stat, wholeGenre)).toBe(10);
    }
  });
});
