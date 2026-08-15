import { ITEMS } from "../data/items";
import type { InventoryItem } from "./types";

// Combined XP multiplier from every currently-equipped item that has an
// xpBonus effect. Multiple equipped items with a bonus stack
// multiplicatively; items with no effect (most of them) contribute 1x.
export function equippedXpMultiplier(inventory: InventoryItem[]): number {
  let multiplier = 1;
  for (const inv of inventory) {
    if (!inv.equipped) continue;
    const def = ITEMS.find((d) => d.id === inv.defId);
    if (def?.effect) multiplier *= def.effect.xpBonus;
  }
  return multiplier;
}
