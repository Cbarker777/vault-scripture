import { useRef, useState } from "react";
import type { Book, Chapter } from "../data/bible/types";
import { logReadingSession } from "../db/adapter";
import type { ReadingSession } from "../session/types";
import { useDwellTimer } from "../session/useDwellTimer";
import { useScrollCompletion } from "../session/useScrollCompletion";
import { isVerified } from "../session/verify";

export function ChapterView({ book, chapter }: { book: Book; chapter: Chapter }) {
  const [reflection, setReflection] = useState("");
  const [logged, setLogged] = useState<{ verified: boolean } | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const lastVerseRef = useRef<HTMLSpanElement | null>(null);

  const dwellSeconds = useDwellTimer(logged === null);
  const scrollCompleted = useScrollCompletion(lastVerseRef);

  function handleLogSession() {
    const verified = isVerified({
      dwellSeconds,
      wordCount: chapter.wordCount,
      scrollCompleted,
      reflection,
      comprehensionPassed: null,
    });

    const session: ReadingSession = {
      id: crypto.randomUUID(),
      bookId: book.id,
      chapter: chapter.number,
      startedAt: startedAtRef.current,
      endedAt: new Date().toISOString(),
      dwellSeconds,
      reflection: reflection.trim().length > 0 ? reflection.trim() : null,
      comprehensionPassed: null,
      xpAwarded: 0,
      verified,
    };

    void logReadingSession(session);
    setLogged({ verified });
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
              disabled={logged !== null}
              onClick={handleLogSession}
            >
              LOG SESSION
            </button>
            {logged && (
              <span style={{ color: "var(--phosphor-dim)" }}>
                {logged.verified
                  ? "Logged. Verified — XP awaits the progression system."
                  : "Logged. No XP — verification incomplete."}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
