import type { ItemDef, ItemTier } from "./types";

const TIER_ORDER: ItemTier[] = ["Common", "Marked", "Rare", "Relic"];
const TIER_WEIGHTS: Record<ItemTier, number> = {
  Common: 60,
  Marked: 25,
  Rare: 12,
  Relic: 3,
};

export function rollTier(random: () => number = Math.random, minTier: ItemTier = "Common"): ItemTier {
  const minIndex = TIER_ORDER.indexOf(minTier);
  const eligible = TIER_ORDER.slice(minIndex);
  const total = eligible.reduce((sum, t) => sum + TIER_WEIGHTS[t], 0);

  let roll = random() * total;
  for (const tier of eligible) {
    if (roll < TIER_WEIGHTS[tier]) return tier;
    roll -= TIER_WEIGHTS[tier];
  }
  return eligible[eligible.length - 1];
}

export function rollItem(
  items: ItemDef[],
  options?: { random?: () => number; minTier?: ItemTier },
): ItemDef | null {
  const random = options?.random ?? Math.random;
  const minTier = options?.minTier ?? "Common";
  const tier = rollTier(random, minTier);

  const candidates = items.filter((i) => i.tier === tier);
  if (candidates.length === 0) return null;

  return candidates[Math.floor(random() * candidates.length)];
}
