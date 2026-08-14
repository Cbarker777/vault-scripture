import { describe, expect, it } from "vitest";
import { countWords, expectedSeconds, isVerified } from "./verify";

describe("expectedSeconds", () => {
  it("computes a 240wpm ceiling", () => {
    expect(expectedSeconds(240)).toBe(60);
    expect(expectedSeconds(0)).toBe(0);
  });
});

describe("countWords", () => {
  it("counts whitespace-separated words", () => {
    expect(countWords("  hello   world  ")).toBe(2);
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });
});

describe("isVerified", () => {
  const base = {
    dwellSeconds: 60,
    wordCount: 240,
    scrollCompleted: true,
    reflection: null as string | null,
    comprehensionPassed: null as boolean | null,
  };

  it("fails when dwell time is under the expected floor", () => {
    expect(isVerified({ ...base, dwellSeconds: 59 })).toBe(false);
  });

  it("fails when scroll never completed, even with a good reflection", () => {
    expect(
      isVerified({
        ...base,
        scrollCompleted: false,
        reflection: "word ".repeat(15),
      }),
    ).toBe(false);
  });

  it("fails when reflection is under 15 words and no comprehension check", () => {
    expect(isVerified({ ...base, reflection: "word ".repeat(14) })).toBe(false);
  });

  it("passes on dwell + scroll + a 15-word reflection", () => {
    expect(isVerified({ ...base, reflection: "word ".repeat(15) })).toBe(true);
  });

  it("defers to comprehension result when present, ignoring reflection", () => {
    expect(isVerified({ ...base, comprehensionPassed: true, reflection: null })).toBe(true);
    expect(
      isVerified({
        ...base,
        comprehensionPassed: false,
        reflection: "word ".repeat(50),
      }),
    ).toBe(false);
  });
});
