import { useEffect, useState } from "react";
import { loadBook } from "../data/bible";
import type { Book } from "../data/bible/types";
import { useReaderStore } from "../store/reader";
import { ChapterView } from "./ChapterView";

export function ReaderPane() {
  const bookId = useReaderStore((s) => s.bookId);
  const chapter = useReaderStore((s) => s.chapter);
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBook(null);
    void loadBook(bookId).then((loaded) => {
      if (!cancelled) setBook(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  if (!book) {
    return (
      <div className="reading-pane px-6 py-10 text-center">LOADING SCRIPTURE PACK…</div>
    );
  }

  const chapterData = book.chapters.find((c) => c.number === chapter);
  if (!chapterData) {
    return (
      <div className="reading-pane px-6 py-10 text-center">
        CHAPTER NOT FOUND — check the chapter number and try again.
      </div>
    );
  }

  return <ChapterView key={`${book.id}:${chapterData.number}`} book={book} chapter={chapterData} />;
}
