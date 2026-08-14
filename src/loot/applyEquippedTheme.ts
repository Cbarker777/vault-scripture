import { ITEMS } from "../data/items";
import { listInventoryItems } from "../db/adapter";

const ALL_OVERRIDE_KEYS = Array.from(new Set(ITEMS.flatMap((i) => Object.keys(i.apply))));

// Resets every CSS variable any item could override, then re-applies
// whatever is currently equipped. Called on app load and after every
// equip/unequip so the effect persists across screens.
export async function applyEquippedTheme(): Promise<void> {
  const items = await listInventoryItems();
  const root = document.documentElement.style;

  for (const key of ALL_OVERRIDE_KEYS) root.removeProperty(key);

  for (const inv of items.filter((i) => i.equipped)) {
    const def = ITEMS.find((d) => d.id === inv.defId);
    if (!def) continue;
    for (const [key, value] of Object.entries(def.apply)) {
      root.setProperty(key, value);
    }
  }
}
