export type ItemSlot =
  | "terminal-theme"
  | "reader-typeface"
  | "holotape"
  | "desk-object"
  | "bookmark";

export type ItemTier = "Common" | "Marked" | "Rare" | "Relic";

export type ItemDef = {
  id: string;
  slot: ItemSlot;
  tier: ItemTier;
  name: string;
  flavor: string;
  // CSS custom-property overrides applied while the item is equipped —
  // no item should ever need bespoke rendering code.
  apply: Record<string, string>;
};

export type InventoryItem = {
  id: string;
  defId: string;
  acquiredAt: string;
  equipped: boolean;
};
