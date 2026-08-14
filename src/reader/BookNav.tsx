import { BOOKS } from "../data/bible";
import { useReaderStore } from "../store/reader";

export function BookNav() {
  const bookId = useReaderStore((s) => s.bookId);
  const chapter = useReaderStore((s) => s.chapter);
  const goTo = useReaderStore((s) => s.goTo);

  const currentBook = BOOKS.find((b) => b.id === bookId) ?? BOOKS[0];

  function handleBookChange(nextBookId: string) {
    void goTo(nextBookId, 1);
  }

  function handleChapterChange(nextChapter: number) {
    void goTo(bookId, nextChapter);
  }

  return (
    <nav className="flex flex-wrap items-center gap-3 border-b border-neutral-300 px-4 py-3 text-sm">
      <select
        className="rounded border border-neutral-400 bg-white px-2 py-1"
        value={bookId}
        onChange={(e) => handleBookChange(e.target.value)}
      >
        {BOOKS.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        className="rounded border border-neutral-400 bg-white px-2 py-1"
        value={chapter}
        onChange={(e) => handleChapterChange(Number(e.target.value))}
      >
        {Array.from({ length: currentBook.chapterCount }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            Chapter {n}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="rounded border border-neutral-400 px-2 py-1 disabled:opacity-40"
        disabled={chapter <= 1}
        onClick={() => handleChapterChange(chapter - 1)}
      >
        Previous
      </button>
      <button
        type="button"
        className="rounded border border-neutral-400 px-2 py-1 disabled:opacity-40"
        disabled={chapter >= currentBook.chapterCount}
        onClick={() => handleChapterChange(chapter + 1)}
      >
        Next
      </button>
    </nav>
  );
}
