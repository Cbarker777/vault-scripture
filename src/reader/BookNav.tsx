import { useState } from "react";
import { BOOKS } from "../data/bible";
import { useReaderStore } from "../store/reader";
import { applyReadingTheme } from "./applyReadingTheme";
import { READING_THEMES, type ReadingThemeId } from "./readingThemes";
import { getStoredReadingThemeId, setStoredReadingThemeId } from "./readingThemeStorage";

export function BookNav() {
  const bookId = useReaderStore((s) => s.bookId);
  const chapter = useReaderStore((s) => s.chapter);
  const goTo = useReaderStore((s) => s.goTo);
  const [readingThemeId, setReadingThemeId] = useState<ReadingThemeId>(() =>
    getStoredReadingThemeId(),
  );

  const currentBook = BOOKS.find((b) => b.id === bookId) ?? BOOKS[0];

  function handleBookChange(nextBookId: string) {
    void goTo(nextBookId, 1);
  }

  function handleChapterChange(nextChapter: number) {
    void goTo(bookId, nextChapter);
  }

  function handleReadingThemeChange(id: ReadingThemeId) {
    setReadingThemeId(id);
    setStoredReadingThemeId(id);
    applyReadingTheme(id);
  }

  return (
    <nav className="chrome flex flex-wrap items-center gap-3 border-b border-current px-4 py-3 text-sm">
      <select
        className="chrome-label border border-current bg-transparent px-2 py-1"
        value={bookId}
        onChange={(e) => handleBookChange(e.target.value)}
      >
        {BOOKS.map((b) => (
          <option key={b.id} value={b.id} style={{ background: "var(--vault)" }}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        className="chrome-label border border-current bg-transparent px-2 py-1"
        value={chapter}
        onChange={(e) => handleChapterChange(Number(e.target.value))}
      >
        {Array.from({ length: currentBook.chapterCount }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n} style={{ background: "var(--vault)" }}>
            Chapter {n}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="chrome-label border border-current px-2 py-1 disabled:opacity-40"
        disabled={chapter <= 1}
        onClick={() => handleChapterChange(chapter - 1)}
      >
        Previous
      </button>
      <button
        type="button"
        className="chrome-label border border-current px-2 py-1 disabled:opacity-40"
        disabled={chapter >= currentBook.chapterCount}
        onClick={() => handleChapterChange(chapter + 1)}
      >
        Next
      </button>
      <label htmlFor="reading-theme" className="chrome-label ml-auto">
        Reading Theme
      </label>
      <select
        id="reading-theme"
        className="chrome-label border border-current bg-transparent px-2 py-1"
        value={readingThemeId}
        onChange={(e) => handleReadingThemeChange(e.target.value as ReadingThemeId)}
      >
        {READING_THEMES.map((t) => (
          <option key={t.id} value={t.id} style={{ background: "var(--vault)" }}>
            {t.name}
          </option>
        ))}
      </select>
    </nav>
  );
}
