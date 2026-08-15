import { describe, expect, it } from "vitest";
import type { InventoryItem } from "./types";
import { equippedXpMultiplier } from "./xpBonus";

function inv(overrides: Partial<InventoryItem>): InventoryItem {
  return {
    id: crypto.randomUUID(),
    defId: "holotape-hum",
    acquiredAt: "2026-01-01T00:00:00.000Z",
    equipped: true,
    ...overrides,
  };
}

describe("equippedXpMultiplier", () => {
  it("is 1x with no inventory", () => {
    expect(equippedXpMultiplier([])).toBe(1);
  });

  it("is 1x when the item with a bonus is not equipped", () => {
    expect(equippedXpMultiplier([inv({ defId: "holotape-hum", equipped: false })])).toBe(1);
  });

  it("applies the equipped item's bonus", () => {
    expect(equippedXpMultiplier([inv({ defId: "holotape-hum", equipped: true })])).toBeCloseTo(
      1.1,
    );
  });

  it("ignores equipped items with no effect", () => {
    expect(
      equippedXpMultiplier([inv({ defId: "theme-phosphor-standard", equipped: true })]),
    ).toBe(1);
  });

  it("stacks multiple equipped bonus items multiplicatively", () => {
    // holotape-hum is the only item with an effect today, but the
    // stacking behavior itself should still hold for two equipped copies.
    const multiplier = equippedXpMultiplier([
      inv({ id: "a", defId: "holotape-hum", equipped: true }),
      inv({ id: "b", defId: "holotape-hum", equipped: true }),
    ]);
    expect(multiplier).toBeCloseTo(1.1 * 1.1);
  });

  it("ignores an unknown defId gracefully", () => {
    expect(equippedXpMultiplier([inv({ defId: "not-a-real-item", equipped: true })])).toBe(1);
  });
});
