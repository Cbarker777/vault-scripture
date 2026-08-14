import {
  addInventoryItem,
  creditCaps,
  listReadingSessions,
  listSelectedPerks,
} from "../db/adapter";
import { ITEMS } from "../data/items";
import type { ItemDef } from "../loot/types";
import { rollItem } from "../loot/roll";
import { levelForXp } from "../progression/level";
import { getBountyForDate, isBountyComplete } from "../quests/bounty";
import { deriveQuests } from "../quests/quests";
import type { ReadingSession } from "../session/types";
import { currentStreakDays } from "../streak";

const CAPS_STREAK: Record<number, number> = { 7: 10, 30: 50, 100: 200 };
const CAPS_QUEST_COMPLETE = 25;
const CAPS_BOUNTY = 5;
const CAPS_BOUNTY_LECTIONARY_BONUS = 10;
const STREAK_MILESTONES = [7, 30, 100];

export type SessionEffects = {
  leveledUp: boolean;
  newLevel: number;
  itemsDropped: ItemDef[];
  capsEarned: number;
};

async function grantItem(defId: string, at: string): Promise<void> {
  await addInventoryItem({ id: crypto.randomUUID(), defId, acquiredAt: at, equipped: false });
}

// Runs every reward-bearing side effect of a just-logged session: XP
// level-up detection, the chapter-completion loot roll, the guaranteed
// Rare+ drop and caps on finishing a questline, streak-milestone caps
// and loot, and daily bounty caps. Every earn is keyed by a unique,
// stable reason string and credited through creditCaps's INSERT OR
// IGNORE, so re-deriving the same event twice never double-pays.
export async function runPostSessionEffects(session: ReadingSession): Promise<SessionEffects> {
  const allSessions = await listReadingSessions();
  const now = new Date();
  const nowIso = now.toISOString();
  const itemsDropped: ItemDef[] = [];
  let capsEarned = 0;

  const totalXpAfter = allSessions.reduce((sum, s) => sum + s.xpAwarded, 0);
  const totalXpBefore = totalXpAfter - session.xpAwarded;
  const levelBefore = levelForXp(totalXpBefore);
  const levelAfter = levelForXp(totalXpAfter);

  if (session.verified) {
    const item = rollItem(ITEMS);
    if (item) {
      await grantItem(item.id, nowIso);
      itemsDropped.push(item);
    }
  }

  const quests = deriveQuests(allSessions);
  const completedQuest = quests.find(
    (q) => q.bookId === session.bookId && q.completedAt === session.endedAt,
  );
  if (completedQuest) {
    const applied = await creditCaps(`quest:${completedQuest.bookId}`, CAPS_QUEST_COMPLETE, nowIso);
    if (applied) {
      capsEarned += CAPS_QUEST_COMPLETE;
      const relic = rollItem(ITEMS, { minTier: "Rare" });
      if (relic) {
        await grantItem(relic.id, nowIso);
        itemsDropped.push(relic);
      }
    }
  }

  const streakDays = currentStreakDays(
    allSessions.map((s) => s.endedAt),
    now,
  );
  for (const milestone of STREAK_MILESTONES) {
    if (streakDays < milestone) continue;
    const applied = await creditCaps(`streak:${milestone}`, CAPS_STREAK[milestone], nowIso);
    if (applied) {
      capsEarned += CAPS_STREAK[milestone];
      const item = rollItem(ITEMS);
      if (item) {
        await grantItem(item.id, nowIso);
        itemsDropped.push(item);
      }
    }
  }

  const bounty = getBountyForDate(now);
  if (
    bounty.bookId === session.bookId &&
    bounty.chapter === session.chapter &&
    isBountyComplete(allSessions, bounty, now)
  ) {
    const perks = await listSelectedPerks();
    const hasLectionary = perks.some((p) => p.perkId === "lectionary");
    const amount = CAPS_BOUNTY + (hasLectionary ? CAPS_BOUNTY_LECTIONARY_BONUS : 0);
    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const applied = await creditCaps(`bounty:${dateKey}`, amount, nowIso);
    if (applied) capsEarned += amount;
  }

  return {
    leveledUp: levelAfter > levelBefore,
    newLevel: levelAfter,
    itemsDropped,
    capsEarned,
  };
}
