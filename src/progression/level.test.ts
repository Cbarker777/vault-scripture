import { describe, expect, it } from "vitest";
import { levelForXp, xpForLevel, xpIntoCurrentLevel, xpToNextLevel } from "./level";

describe("xpForLevel", () => {
  it("costs 100 to go from level 1 to 2", () => {
    expect(xpForLevel(1)).toBe(100);
  });

  it("costs ~3162 to go from level 10 to 11", () => {
    expect(xpForLevel(10)).toBe(3162);
  });
});

describe("levelForXp", () => {
  it("starts new profiles at level 1", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("stays at level 1 just under the level-2 threshold", () => {
    expect(levelForXp(99)).toBe(1);
  });

  it("reaches level 2 exactly at the threshold", () => {
    expect(levelForXp(100)).toBe(2);
  });

  it("reaches level 3 after both thresholds are cleared", () => {
    const toLevel3 = xpForLevel(1) + xpForLevel(2);
    expect(levelForXp(toLevel3 - 1)).toBe(2);
    expect(levelForXp(toLevel3)).toBe(3);
  });

  it("never decreases as xp increases", () => {
    let lastLevel = levelForXp(0);
    for (let xp = 0; xp <= 20_000; xp += 137) {
      const level = levelForXp(xp);
      expect(level).toBeGreaterThanOrEqual(lastLevel);
      lastLevel = level;
    }
  });
});

describe("xpIntoCurrentLevel / xpToNextLevel", () => {
  it("sum to the level's total cost", () => {
    const xp = 250;
    const level = levelForXp(xp);
    expect(xpIntoCurrentLevel(xp) + xpToNextLevel(xp)).toBe(xpForLevel(level));
  });

  it("resets to 0 right at a level boundary", () => {
    expect(xpIntoCurrentLevel(100)).toBe(0);
    expect(xpToNextLevel(100)).toBe(xpForLevel(2));
  });
});
