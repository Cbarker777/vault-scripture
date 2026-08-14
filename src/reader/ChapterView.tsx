import { useRef, useState } from "react";
import type { Book, Chapter } from "../data/bible/types";
import { hasReadChapterBefore, listSelectedPerks, logReadingSession } from "../db/adapter";
import { runPostSessionEffects, type SessionEffects } from "../game/onSessionLogged";
import { generateId } from "../lib/id";
import { isNightShiftHours } from "../perks/nightShift";
import { calculateXpAward } from "../progression/xp-award";
import type { ReadingSession } from "../session/types";
import { useDwellTimer } from "../session/useDwellTimer";
import { useScrollCompletion } from "../session/useScrollCompletion";
import { isVerified } from "../session/verify";
import { useGameEventsStore } from "../store/gameEvents";

type LoggedState = {
  verified: boolean;
  xpAwarded: number;
  effects: SessionEffects;
};

export function ChapterView({ book, chapter }: { book: Book; chapter: Chapter }) {
  const [reflection, setReflection] = useState("");
  const [logged, setLogged] = useState<LoggedState | null>(null);
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const lastVerseRef = useRef<HTMLSpanElement | null>(null);
  const announceLevelUp = useGameEventsStore((s) => s.announceLevelUp);
  const requestPerkPick = useGameEventsStore((s) => s.requestPerkPick);

  const dwellSeconds = useDwellTimer(logged === null);
  const scrollCompleted = useScrollCompletion(lastVerseRef);

  async function handleLogSession() {
    setLogging(true);
    setLogError(null);

    try {
      const verified = isVerified({
        dwellSeconds,
        wordCount: chapter.wordCount,
        scrollCompleted,
        reflection,
        comprehensionPassed: null,
      });

      const [alreadyRead, perks] = await Promise.all([
        hasReadChapterBefore(book.id, chapter.number),
        listSelectedPerks(),
      ]);
      const hasNightShift = perks.some((p) => p.perkId === "night-shift");

      const xpAwarded = calculateXpAward({
        verified,
        wordCount: chapter.wordCount,
        dwellSeconds,
        firstTimeReadingThisChapter: !alreadyRead,
        nightShiftBonus: hasNightShift && isNightShiftHours(new Date()),
      });

      const session: ReadingSession = {
        id: generateId(),
        bookId: book.id,
        chapter: chapter.number,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        dwellSeconds,
        reflection: reflection.trim().length > 0 ? reflection.trim() : null,
        comprehensionPassed: null,
        xpAwarded,
        verified,
      };

      await logReadingSession(session);
      const effects = await runPostSessionEffects(session);

      if (effects.leveledUp) {
        announceLevelUp(effects.newLevel);
        requestPerkPick(effects.newLevel);
      }

      setLogged({ verified, xpAwarded, effects });
    } catch (err) {
      console.error(err);
      setLogError("LOG SESSION FAILED — check the console and try again.");
    } finally {
      setLogging(false);
    }
  }

  return (
    <div>
      <div className="reading-pane px-6 py-10">
        <div className="measure">
          <h1 className="mb-6 text-2xl font-normal">
            {book.name} {chapter.number}
          </h1>
          <p>
            {chapter.verses.map((v, i) => {
              const isLast = i === chapter.verses.length - 1;
              return (
                <span key={v.number} ref={isLast ? lastVerseRef : undefined}>
                  <sup className="mr-1" style={{ opacity: 0.5 }}>
                    {v.number}
                  </sup>
                  {v.text}{" "}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      <div className="chrome px-6 py-6 text-sm">
        <div className="measure mx-auto">
          <label htmlFor="reflection" className="chrome-label mb-2 block">
            Reflection ({reflection.trim() ? reflection.trim().split(/\s+/).length : 0} words, 15
            minimum)
          </label>
          <textarea
            id="reflection"
            className="w-full border border-current bg-transparent p-2"
            rows={4}
            value={reflection}
            disabled={logged !== null}
            onChange={(e) => setReflection(e.target.value)}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="chrome-label border border-current px-3 py-1 disabled:opacity-40"
              disabled={logged !== null || logging}
              onClick={() => void handleLogSession()}
            >
              LOG SESSION
            </button>
            {logged && (
              <span style={{ color: "var(--phosphor-dim)" }}>{formatLoggedMessage(logged)}</span>
            )}
            {logError && <span style={{ color: "var(--rust)" }}>{logError}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatLoggedMessage(logged: LoggedState): string {
  if (!logged.verified) return "Logged. No XP — verification incomplete.";

  const parts = [`Logged. Verified — +${logged.xpAwarded} XP.`];
  if (logged.effects.capsEarned > 0) parts.push(`+${logged.effects.capsEarned} CAPS.`);
  if (logged.effects.itemsDropped.length > 0) {
    parts.push(`DROPPED: ${logged.effects.itemsDropped.map((i) => i.name).join(", ")}.`);
  }
  return parts.join(" ");
}
