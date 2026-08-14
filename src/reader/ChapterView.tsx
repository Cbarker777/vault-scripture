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
    <article
      className="mx-auto max-w-[68ch] px-6 py-10"
      style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "19px", lineHeight: 1.75 }}
    >
      <h1 className="mb-6 text-2xl font-normal">
        {book.name} {chapter.number}
      </h1>
      <p>
        {chapter.verses.map((v, i) => {
          const isLast = i === chapter.verses.length - 1;
          return (
            <span key={v.number} ref={isLast ? lastVerseRef : undefined}>
              <sup className="mr-1 text-neutral-400">{v.number}</sup>
              {v.text}{" "}
            </span>
          );
        })}
      </p>

      <div className="mt-10 border-t border-neutral-300 pt-6 font-sans text-sm">
        <label htmlFor="reflection" className="mb-2 block text-neutral-600">
          Reflection ({reflection.trim() ? reflection.trim().split(/\s+/).length : 0} words, 15
          minimum)
        </label>
        <textarea
          id="reflection"
          className="w-full rounded border border-neutral-400 p-2"
          rows={4}
          value={reflection}
          disabled={logged !== null}
          onChange={(e) => setReflection(e.target.value)}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            className="rounded border border-neutral-400 px-3 py-1 disabled:opacity-40"
            disabled={logged !== null}
            onClick={handleLogSession}
          >
            LOG SESSION
          </button>
          {logged && (
            <span className="text-neutral-600">
              {logged.verified
                ? "Logged. Verified — XP awaits the progression system."
                : "Logged. No XP — verification incomplete."}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
