import { useEffect, useRef, useState } from "react";
import type { Book, Chapter } from "../data/bible/types";
import { loadChapterQuestions } from "../data/questions";
import { gradeComprehensionCheck } from "../data/questions/grade";
import { pickQuestions } from "../data/questions/pickQuestions";
import type { ComprehensionQuestion } from "../data/questions/types";
import {
  hasReadChapterBefore,
  listInventoryItems,
  listSelectedPerks,
  logReadingSession,
} from "../db/adapter";
import { runPostSessionEffects, type SessionEffects } from "../game/onSessionLogged";
import { generateId } from "../lib/id";
import { equippedXpMultiplier } from "../loot/xpBonus";
import { isNightShiftHours } from "../perks/nightShift";
import { calculateXpAward } from "../progression/xp-award";
import type { ReadingSession } from "../session/types";
import { useDwellTimer } from "../session/useDwellTimer";
import { useScrollCompletion } from "../session/useScrollCompletion";
import { isVerified } from "../session/verify";
import { useGameEventsStore } from "../store/gameEvents";
import { SaveVersePanel } from "../verses/SaveVersePanel";

type LoggedState = {
  verified: boolean;
  xpAwarded: number;
  effects: SessionEffects;
};

type SelectedVerse = {
  number: number;
  text: string;
};

export function ChapterView({ book, chapter }: { book: Book; chapter: Chapter }) {
  const [reflection, setReflection] = useState("");
  const [questions, setQuestions] = useState<ComprehensionQuestion[] | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [logged, setLogged] = useState<LoggedState | null>(null);
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<SelectedVerse | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const lastVerseRef = useRef<HTMLSpanElement | null>(null);
  const announceLevelUp = useGameEventsStore((s) => s.announceLevelUp);
  const requestPerkPick = useGameEventsStore((s) => s.requestPerkPick);

  const dwellSeconds = useDwellTimer(logged === null);
  const scrollCompleted = useScrollCompletion(lastVerseRef);

  useEffect(() => {
    let cancelled = false;
    void loadChapterQuestions(book.id, chapter.number).then((all) => {
      if (cancelled || !all) return;
      const picked = pickQuestions(all);
      setQuestions(picked);
      setAnswers(new Array(picked.length).fill(null));
    });
    return () => {
      cancelled = true;
    };
  }, [book.id, chapter.number]);

  function selectAnswer(questionIndex: number, choiceIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = choiceIndex;
      return next;
    });
  }

  async function handleLogSession() {
    setLogging(true);
    setLogError(null);

    try {
      const allAnswered = questions !== null && answers.every((a) => a !== null);
      const comprehensionPassed = allAnswered
        ? gradeComprehensionCheck(questions!, answers as number[])
        : null;

      const verified = isVerified({
        dwellSeconds,
        wordCount: chapter.wordCount,
        scrollCompleted,
        reflection,
        comprehensionPassed,
      });

      const [alreadyRead, perks, inventory] = await Promise.all([
        hasReadChapterBefore(book.id, chapter.number),
        listSelectedPerks(),
        listInventoryItems(),
      ]);
      const hasNightShift = perks.some((p) => p.perkId === "night-shift");

      const xpAwarded = calculateXpAward({
        verified,
        wordCount: chapter.wordCount,
        dwellSeconds,
        firstTimeReadingThisChapter: !alreadyRead,
        nightShiftBonus: hasNightShift && isNightShiftHours(new Date()),
        itemsMultiplier: equippedXpMultiplier(inventory),
      });

      const session: ReadingSession = {
        id: generateId(),
        bookId: book.id,
        chapter: chapter.number,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        dwellSeconds,
        reflection: reflection.trim().length > 0 ? reflection.trim() : null,
        comprehensionPassed,
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
                <span
                  key={v.number}
                  ref={isLast ? lastVerseRef : undefined}
                  onClick={() => setSelectedVerse({ number: v.number, text: v.text })}
                  style={{ cursor: "pointer" }}
                  title={`Save ${book.name} ${chapter.number}:${v.number}`}
                >
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

      {selectedVerse && (
        <SaveVersePanel
          bookId={book.id}
          bookName={book.name}
          chapter={chapter.number}
          verseNumber={selectedVerse.number}
          verseText={selectedVerse.text}
          onClose={() => setSelectedVerse(null)}
        />
      )}

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

          {questions && (
            <div className="mt-6">
              <div className="chrome-label mb-1" style={{ color: "var(--amber)" }}>
                Comprehension Check (optional)
              </div>
              <p className="mb-3" style={{ color: "var(--phosphor-dim)" }}>
                Answer all {questions.length} to verify instead of writing a reflection —
                answering here takes priority over the reflection above.
              </p>
              <div className="flex flex-col gap-4">
                {questions.map((q, qi) => (
                  <div key={q.question}>
                    <div className="chrome-label mb-2">{q.question}</div>
                    <div className="flex flex-wrap gap-2">
                      {q.choices.map((choice, ci) => (
                        <button
                          key={choice}
                          type="button"
                          disabled={logged !== null}
                          className="border border-current px-2 py-1 disabled:opacity-40"
                          style={{
                            background: answers[qi] === ci ? "var(--phosphor)" : "transparent",
                            color: answers[qi] === ci ? "var(--vault)" : "var(--phosphor)",
                          }}
                          onClick={() => selectAnswer(qi, ci)}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
