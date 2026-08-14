import { useEffect, useState } from "react";
import { listSelectedPerks, selectPerk } from "../db/adapter";
import { useGameEventsStore } from "../store/gameEvents";
import { PERKS } from "./perks";
import type { PerkId } from "./types";

export function PerkPicker() {
  const perkPickLevel = useGameEventsStore((s) => s.perkPickLevel);
  const clearPerkPick = useGameEventsStore((s) => s.clearPerkPick);
  const [ownedPerkIds, setOwnedPerkIds] = useState<PerkId[] | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (perkPickLevel === null) {
      setOwnedPerkIds(null);
      return;
    }
    void listSelectedPerks().then((perks) => setOwnedPerkIds(perks.map((p) => p.perkId)));
  }, [perkPickLevel]);

  if (perkPickLevel === null || ownedPerkIds === null) return null;

  const available = PERKS.filter((p) => !ownedPerkIds.includes(p.id));
  if (available.length === 0) {
    clearPerkPick();
    return null;
  }

  async function pick(perkId: PerkId) {
    if (perkPickLevel === null) return;
    setPicking(true);
    await selectPerk(perkPickLevel, perkId, new Date().toISOString());
    clearPerkPick();
  }

  return (
    <div
      className="chrome"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 480, width: "100%" }}>
        <h2 className="chrome-label mb-4 text-lg" style={{ color: "var(--amber)" }}>
          Level {perkPickLevel} — choose a perk
        </h2>
        <ul className="flex flex-col gap-3">
          {available.map((perk) => (
            <li key={perk.id}>
              <button
                type="button"
                disabled={picking}
                className="chrome-label w-full border border-current px-3 py-2 text-left disabled:opacity-40"
                onClick={() => void pick(perk.id)}
              >
                {perk.name}
                <span
                  className="mt-1 block text-xs normal-case"
                  style={{ color: "var(--phosphor-dim)" }}
                >
                  {perk.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
