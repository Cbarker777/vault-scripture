import { describe, expect, it } from "vitest";
import { calculateXpAward } from "./xp-award";

// wordCount 250 -> baseXP = ceil(250/25) = 10, expectedSeconds = 250/240*60 = 62.5
const WORD_COUNT = 250;
const EXPECTED_SECONDS = 62.5;

describe("calculateXpAward", () => {
  it("awards nothing for an unverified session, no matter how long the dwell", () => {
    expect(
      calculateXpAward({
        verified: false,
        wordCount: WORD_COUNT,
        dwellSeconds: 10_000,
        firstTimeReadingThisChapter: true,
      }),
    ).toBe(0);
  });

  it("pays base XP at exactly the expected dwell time", () => {
    expect(
      calculateXpAward({
        verified: true,
        wordCount: WORD_COUNT,
        dwellSeconds: EXPECTED_SECONDS,
        firstTimeReadingThisChapter: false,
      }),
    ).toBe(10);
  });

  it("pays a partial depth bonus between 1x and 2x expected time", () => {
    expect(
      calculateXpAward({
        verified: true,
        wordCount: WORD_COUNT,
        dwellSeconds: EXPECTED_SECONDS * 1.5,
        firstTimeReadingThisChapter: false,
      }),
    ).toBe(13);
  });

  it("caps the depth bonus at 1.5x when dwell reaches 2x expected", () => {
    expect(
      calculateXpAward({
        verified: true,
        wordCount: WORD_COUNT,
        dwellSeconds: EXPECTED_SECONDS * 2,
        firstTimeReadingThisChapter: false,
      }),
    ).toBe(15);
  });

  it("does not pay more past 2x expected time — idling is worthless", () => {
    const atCap = calculateXpAward({
      verified: true,
      wordCount: WORD_COUNT,
      dwellSeconds: EXPECTED_SECONDS * 2,
      firstTimeReadingThisChapter: false,
    });
    const wayPastCap = calculateXpAward({
      verified: true,
      wordCount: WORD_COUNT,
      dwellSeconds: EXPECTED_SECONDS * 10,
      firstTimeReadingThisChapter: false,
    });
    expect(wayPastCap).toBe(atCap);
  });

  it("applies the 1.5x first-read bonus", () => {
    expect(
      calculateXpAward({
        verified: true,
        wordCount: WORD_COUNT,
        dwellSeconds: EXPECTED_SECONDS,
        firstTimeReadingThisChapter: true,
      }),
    ).toBe(15);
  });

  it("pays less on a reread than a first read, holding dwell constant", () => {
    const reread = calculateXpAward({
      verified: true,
      wordCount: WORD_COUNT,
      dwellSeconds: EXPECTED_SECONDS * 2,
      firstTimeReadingThisChapter: false,
    });
    const firstRead = calculateXpAward({
      verified: true,
      wordCount: WORD_COUNT,
      dwellSeconds: EXPECTED_SECONDS * 2,
      firstTimeReadingThisChapter: true,
    });
    expect(firstRead).toBeGreaterThan(reread);
    expect(firstRead).toBe(23);
  });

  it("makes grinding one short chapter worthless: rereads pay a small fraction of a first read", () => {
    const shortChapterFirstRead = calculateXpAward({
      verified: true,
      wordCount: 30,
      dwellSeconds: 30 / 240 * 60,
      firstTimeReadingThisChapter: true,
    });
    const shortChapterReread = calculateXpAward({
      verified: true,
      wordCount: 30,
      dwellSeconds: 30 / 240 * 60,
      firstTimeReadingThisChapter: false,
    });
    expect(shortChapterReread).toBeLessThan(shortChapterFirstRead);
  });
});
