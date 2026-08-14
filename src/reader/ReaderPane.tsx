import { useEffect, useState } from "react";
import { loadBook } from "../data/bible";
import type { Book } from "../data/bible/types";
import { useReaderStore } from "../store/reader";

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
    return <div className="px-6 py-10 text-center text-neutral-500">Loading…</div>;
  }

  const chapterData = book.chapters.find((c) => c.number === chapter);
  if (!chapterData) {
    return <div className="px-6 py-10 text-center text-neutral-500">Chapter not found.</div>;
  }

  return (
    <article
      className="mx-auto max-w-[68ch] px-6 py-10"
      style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "19px", lineHeight: 1.75 }}
    >
      <h1 className="mb-6 text-2xl font-normal">
        {book.name} {chapterData.number}
      </h1>
      <p>
        {chapterData.verses.map((v) => (
          <span key={v.number}>
            <sup className="mr-1 text-neutral-400">{v.number}</sup>
            {v.text}{" "}
          </span>
        ))}
      </p>
    </article>
  );
}
