import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBountyForDate } from "../quests/bounty";
import type { ReadingSession } from "../session/types";

const listReadingSessions = vi.fn();
const creditCaps = vi.fn().mockResolvedValue(true);
const addInventoryItem = vi.fn().mockResolvedValue(undefined);
const listSelectedPerks = vi.fn().mockResolvedValue([]);
vi.mock("../db/adapter", () => ({
  listReadingSessions: (...args: unknown[]) => listReadingSessions(...args),
  creditCaps: (...args: unknown[]) => creditCaps(...args),
  addInventoryItem: (...args: unknown[]) => addInventoryItem(...args),
  listSelectedPerks: (...args: unknown[]) => listSelectedPerks(...args),
}));

const fixedItem = {
  id: "theme-phosphor-standard",
  slot: "terminal-theme" as const,
  tier: "Common" as const,
  name: "Standard Phosphor",
  flavor: "",
  apply: {},
};
const rollItem = vi.fn().mockReturnValue(fixedItem);
vi.mock("../loot/roll", () => ({
  rollItem: (...args: unknown[]) => rollItem(...args),
}));

// Imported after the mocks above so it picks up the mocked modules.
const { runPostSessionEffects } = await import("./onSessionLogged");

function session(overrides: Partial<ReadingSession>): ReadingSession {
  return {
    id: crypto.randomUUID(),
    bookId: "jud", // 1 chapter — cheap to complete the questline
    chapter: 1,
    startedAt: "2026-06-10T12:00:00.000Z",
    endedAt: "2026-06-10T12:00:00.000Z",
    dwellSeconds: 60,
    reflection: null,
    comprehensionPassed: null,
    xpAwarded: 0,
    verified: true,
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 10, 12, 0, 0));
  listReadingSessions.mockReset();
  creditCaps.mockReset().mockResolvedValue(true);
  addInventoryItem.mockReset().mockResolvedValue(undefined);
  listSelectedPerks.mockReset().mockResolvedValue([]);
  rollItem.mockReset().mockReturnValue(fixedItem);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("runPostSessionEffects", () => {
  it("detects a level-up crossing the 100xp threshold", async () => {
    const newSession = session({ xpAwarded: 60 });
    listReadingSessions.mockResolvedValue([session({ xpAwarded: 50 }), newSession]);

    const effects = await runPostSessionEffects(newSession);

    expect(effects.leveledUp).toBe(true);
    expect(effects.newLevel).toBe(2);
  });

  it("does not report a level-up when still within the same level", async () => {
    const newSession = session({ xpAwarded: 10 });
    listReadingSessions.mockResolvedValue([session({ xpAwarded: 5 }), newSession]);

    const effects = await runPostSessionEffects(newSession);
    expect(effects.leveledUp).toBe(false);
  });

  it("rolls a chapter-completion item for a verified session", async () => {
    const newSession = session({ verified: true });
    listReadingSessions.mockResolvedValue([newSession]);

    const effects = await runPostSessionEffects(newSession);

    expect(rollItem).toHaveBeenCalled();
    expect(effects.itemsDropped).toContainEqual(fixedItem);
    expect(addInventoryItem).toHaveBeenCalledWith(
      expect.objectContaining({ defId: fixedItem.id }),
    );
  });

  it("does not roll a chapter-completion item for an unverified session", async () => {
    // Ruth has 4 chapters, so reading just chapter 1 doesn't also trigger
    // a book-completion roll — isolates the chapter-completion path.
    const newSession = session({ bookId: "rut", chapter: 1, verified: false });
    listReadingSessions.mockResolvedValue([newSession]);

    await runPostSessionEffects(newSession);
    expect(rollItem).not.toHaveBeenCalled();
  });

  it("credits questline-completion caps and rolls a guaranteed Rare+ item when a book finishes", async () => {
    // Jude has exactly 1 chapter, so this single session completes it.
    const newSession = session({ bookId: "jud", chapter: 1, verified: false });
    listReadingSessions.mockResolvedValue([newSession]);

    const effects = await runPostSessionEffects(newSession);

    expect(creditCaps).toHaveBeenCalledWith("quest:jud", 25, expect.any(String));
    expect(rollItem).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ minTier: "Rare" }),
    );
    expect(effects.capsEarned).toBeGreaterThanOrEqual(25);
  });

  it("does not credit quest caps when the ledger reports it was already claimed", async () => {
    creditCaps.mockResolvedValue(false);
    const newSession = session({ bookId: "jud", chapter: 1, verified: false });
    listReadingSessions.mockResolvedValue([newSession]);

    const effects = await runPostSessionEffects(newSession);
    expect(effects.capsEarned).toBe(0);
  });

  it("credits a 7-day streak milestone", async () => {
    const days = [4, 5, 6, 7, 8, 9, 10].map((d) =>
      session({ bookId: "rut", chapter: 1, endedAt: new Date(2026, 5, d, 12).toISOString() }),
    );
    const newSession = days[days.length - 1];
    listReadingSessions.mockResolvedValue(days);

    const effects = await runPostSessionEffects(newSession);

    expect(creditCaps).toHaveBeenCalledWith("streak:7", 10, expect.any(String));
    expect(effects.capsEarned).toBeGreaterThanOrEqual(10);
  });

  it("credits caps for completing today's bounty at the exact chapter", async () => {
    const now = new Date(2026, 5, 10, 12, 0, 0);
    const bounty = getBountyForDate(now);
    const newSession = session({ bookId: bounty.bookId, chapter: bounty.chapter, verified: false });
    listReadingSessions.mockResolvedValue([newSession]);

    const effects = await runPostSessionEffects(newSession);

    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    expect(creditCaps).toHaveBeenCalledWith(`bounty:${dateKey}`, 5, expect.any(String));
    expect(effects.capsEarned).toBeGreaterThanOrEqual(5);
  });

  it("pays the Lectionary bonus on top of the base bounty caps when owned", async () => {
    listSelectedPerks.mockResolvedValue([
      { level: 3, perkId: "lectionary", selectedAt: "2026-01-01T00:00:00.000Z" },
    ]);
    const now = new Date(2026, 5, 10, 12, 0, 0);
    const bounty = getBountyForDate(now);
    const newSession = session({ bookId: bounty.bookId, chapter: bounty.chapter, verified: false });
    listReadingSessions.mockResolvedValue([newSession]);

    await runPostSessionEffects(newSession);

    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    expect(creditCaps).toHaveBeenCalledWith(`bounty:${dateKey}`, 15, expect.any(String));
  });
});
