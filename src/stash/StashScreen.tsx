import { useEffect, useState } from "react";
import { ITEMS } from "../data/items";
import { listInventoryItems, setItemEquipped } from "../db/adapter";
import { applyEquippedTheme } from "../loot/applyEquippedTheme";
import type { InventoryItem, ItemDef, ItemTier } from "../loot/types";

const TIER_ORDER: ItemTier[] = ["Relic", "Rare", "Marked", "Common"];

type Entry = { inv: InventoryItem; def: ItemDef };

export function StashScreen() {
  const [items, setItems] = useState<InventoryItem[] | null>(null);

  async function refresh() {
    setItems(await listInventoryItems());
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (items === null) {
    return (
      <div className="chrome chrome-label min-h-screen px-8 py-10 text-sm">Loading stash…</div>
    );
  }

  async function toggleEquipped(item: InventoryItem) {
    await setItemEquipped(item.id, !item.equipped);
    await applyEquippedTheme();
    await refresh();
  }

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    entries: items
      .map((inv): Entry | null => {
        const def = ITEMS.find((d) => d.id === inv.defId);
        return def ? { inv, def } : null;
      })
      .filter((e): e is Entry => e !== null && e.def.tier === tier),
  })).filter((g) => g.entries.length > 0);

  return (
    <div className="chrome min-h-screen px-8 py-10 text-sm">
      <h1 className="chrome-label mb-6 text-lg" style={{ color: "var(--amber)" }}>
        Stash
      </h1>

      {items.length === 0 ? (
        <p className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          STASH EMPTY — complete a chapter to pull a drop
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(({ tier, entries }) => (
            <section key={tier}>
              <h2 className="chrome-label mb-3" style={{ color: "var(--amber)" }}>
                {tier}
              </h2>
              <ul className="flex flex-col gap-2">
                {entries.map(({ inv, def }) => (
                  <li key={inv.id} className="flex items-center gap-3">
                    <span className="chrome-label w-48 shrink-0">{def.name}</span>
                    <span className="flex-1">
                      <span style={{ color: "var(--phosphor-dim)" }}>{def.flavor}</span>
                      {def.effect && (
                        <span className="chrome-label ml-2" style={{ color: "var(--amber)" }}>
                          +{Math.round((def.effect.xpBonus - 1) * 100)}% XP WHILE EQUIPPED
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      className="chrome-label shrink-0 border border-current px-2 py-1"
                      onClick={() => void toggleEquipped(inv)}
                    >
                      {inv.equipped ? "Unequip" : "Equip"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
