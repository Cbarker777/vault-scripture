import { useEffect, useState } from "react";
import { getCapsBalance, listReadingSessions, listSelectedPerks } from "../db/adapter";
import { PERKS } from "../perks/perks";
import type { SelectedPerk } from "../perks/types";
import { xpIntoCurrentLevel, xpToNextLevel } from "../progression/level";
import { deriveLevel, deriveStats, deriveTotalXp } from "../progression/profile";
import type { StatId } from "../progression/stats";
import type { ReadingSession } from "../session/types";

const STAT_ORDER: StatId[] = ["Endurance", "Valor", "Insight", "Vision", "Witness", "Charity"];

export function StatsScreen() {
  const [sessions, setSessions] = useState<ReadingSession[] | null>(null);
  const [caps, setCaps] = useState<number | null>(null);
  const [perks, setPerks] = useState<SelectedPerk[] | null>(null);

  useEffect(() => {
    void listReadingSessions().then(setSessions);
    void getCapsBalance().then(setCaps);
    void listSelectedPerks().then(setPerks);
  }, []);

  if (sessions === null || caps === null || perks === null) {
    return (
      <div className="chrome chrome-label min-h-screen px-8 py-10 text-sm">Loading stats…</div>
    );
  }

  const totalXp = deriveTotalXp(sessions);
  const level = deriveLevel(sessions);
  const stats = deriveStats(sessions);
  const xpInLevel = xpIntoCurrentLevel(totalXp);
  const xpNext = xpToNextLevel(totalXp);
  const xpPct = Math.round((xpInLevel / (xpInLevel + xpNext)) * 100);

  return (
    <div className="chrome min-h-screen px-8 py-10 text-sm">
      <h1 className="chrome-label mb-6 text-lg" style={{ color: "var(--amber)" }}>
        Stats
      </h1>

      <section className="mb-10">
        <div className="chrome-label mb-1">
          Level {level} — {xpInLevel}/{xpInLevel + xpNext} XP to next level
        </div>
        <div className="h-2 border border-current" style={{ maxWidth: 400 }}>
          <div style={{ width: `${xpPct}%`, height: "100%", background: "var(--phosphor)" }} />
        </div>
        <div className="chrome-label mt-3" style={{ color: "var(--amber)" }}>
          {caps} CAPS
        </div>
      </section>

      <section className="mb-10">
        <h2 className="chrome-label mb-3" style={{ color: "var(--amber)" }}>
          Attributes
        </h2>
        <ul className="flex flex-col gap-2" style={{ maxWidth: 400 }}>
          {STAT_ORDER.map((stat) => (
            <li key={stat} className="flex items-center gap-3">
              <span className="chrome-label w-28 shrink-0">{stat}</span>
              <div className="h-2 flex-1 border border-current">
                <div
                  style={{
                    width: `${(stats[stat] / 10) * 100}%`,
                    height: "100%",
                    background: "var(--phosphor)",
                  }}
                />
              </div>
              <span className="w-10 shrink-0 text-right" style={{ color: "var(--phosphor-dim)" }}>
                {stats[stat]}/10
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="chrome-label mb-3" style={{ color: "var(--amber)" }}>
          Perks
        </h2>
        {perks.length === 0 ? (
          <p className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
            No perks installed — level up to pick one.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {perks.map((p) => {
              const def = PERKS.find((perk) => perk.id === p.perkId);
              return (
                <li key={p.level} className="chrome-label">
                  Lv{p.level}: {def?.name ?? p.perkId}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
