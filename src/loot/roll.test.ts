import { describe, expect, it } from "vitest";
import type { ItemDef } from "./types";
import { rollItem, rollTier } from "./roll";

function fixedRandom(value: number): () => number {
  return () => value;
}

describe("rollTier", () => {
  it("returns Common at the bottom of the range", () => {
    expect(rollTier(fixedRandom(0))).toBe("Common");
  });

  it("returns Relic near the top of the range", () => {
    expect(rollTier(fixedRandom(0.999999))).toBe("Relic");
  });

  it("matches the 60/25/12/3 weight boundaries out of 100", () => {
    // cumulative: Common [0,60) Marked [60,85) Rare [85,97) Relic [97,100)
    expect(rollTier(fixedRandom(59.9 / 100))).toBe("Common");
    expect(rollTier(fixedRandom(60.1 / 100))).toBe("Marked");
    expect(rollTier(fixedRandom(84.9 / 100))).toBe("Marked");
    expect(rollTier(fixedRandom(85.1 / 100))).toBe("Rare");
    expect(rollTier(fixedRandom(96.9 / 100))).toBe("Rare");
    expect(rollTier(fixedRandom(97.1 / 100))).toBe("Relic");
  });

  it("with minTier Rare, only ever returns Rare or Relic", () => {
    for (const r of [0, 0.2, 0.5, 0.79, 0.8, 0.99]) {
      expect(["Rare", "Relic"]).toContain(rollTier(fixedRandom(r), "Rare"));
    }
  });
});

describe("rollItem", () => {
  const items: ItemDef[] = [
    { id: "a", slot: "bookmark", tier: "Common", name: "A", flavor: "", apply: {} },
    { id: "b", slot: "bookmark", tier: "Relic", name: "B", flavor: "", apply: {} },
  ];

  it("returns an item of the rolled tier", () => {
    const item = rollItem(items, { random: fixedRandom(0) });
    expect(item?.tier).toBe("Common");
    expect(item?.id).toBe("a");
  });

  it("returns null when no item exists for the rolled tier", () => {
    const onlyCommon: ItemDef[] = [items[0]];
    const item = rollItem(onlyCommon, { random: fixedRandom(0.99) }); // rolls Relic
    expect(item).toBeNull();
  });

  it("respects minTier", () => {
    // eligible range with minTier Rare is [Rare 12, Relic 3] out of 15;
    // 0.9 * 15 = 13.5, past the Rare boundary, so it should land on Relic.
    const item = rollItem(items, { random: fixedRandom(0.9), minTier: "Rare" });
    expect(item?.tier).toBe("Relic");
  });
});
