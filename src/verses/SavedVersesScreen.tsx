import { useEffect, useMemo, useState } from "react";
import { BOOKS } from "../data/bible";
import { deleteSavedVerse, listSavedVerses } from "../db/adapter";
import type { SavedVerse } from "./types";

function bookName(bookId: string): string {
  return BOOKS.find((b) => b.id === bookId)?.name ?? bookId;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function SavedVersesScreen({
  onOpenReading,
}: {
  onOpenReading: (bookId: string, chapter: number) => void;
}) {
  const [verses, setVerses] = useState<SavedVerse[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void listSavedVerses().then(setVerses);
  }, []);

  const filtered = useMemo(() => {
    if (!verses) return [];
    const q = query.trim().toLowerCase();
    if (!q) return verses;
    return verses.filter(
      (v) =>
        bookName(v.bookId).toLowerCase().includes(q) ||
        v.verseText.toLowerCase().includes(q) ||
        (v.note ?? "").toLowerCase().includes(q),
    );
  }, [verses, query]);

  async function handleDelete(id: string) {
    await deleteSavedVerse(id);
    setVerses((prev) => (prev ? prev.filter((v) => v.id !== id) : prev));
  }

  if (verses === null) {
    return (
      <div className="chrome chrome-label min-h-screen px-8 py-10 text-sm">
        Loading saved verses…
      </div>
    );
  }

  return (
    <div className="chrome min-h-screen px-8 py-10 text-sm">
      <h1 className="chrome-label mb-6 text-lg" style={{ color: "var(--amber)" }}>
        Saved Verses
      </h1>

      {verses.length > 0 && (
        <input
          type="text"
          placeholder="SEARCH BOOK, VERSE, OR NOTE"
          className="chrome-label mb-6 w-full max-w-md border border-current bg-transparent px-2 py-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {verses.length === 0 ? (
        <p className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          No verses saved — click a verse in the reader to save it.
        </p>
      ) : filtered.length === 0 ? (
        <p className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          No entries match that search.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((v) => (
            <li key={v.id} className="border-t border-current pt-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="chrome-label"
                  style={{ color: "var(--amber)" }}
                  onClick={() => onOpenReading(v.bookId, v.chapter)}
                >
                  {bookName(v.bookId)} {v.chapter}:{v.verse} — {formatDate(v.savedAt)}
                </button>
                <button
                  type="button"
                  className="chrome-label border border-current px-2 py-1"
                  style={{ color: "var(--rust)" }}
                  onClick={() => void handleDelete(v.id)}
                >
                  Remove
                </button>
              </div>
              <p className="reading-pane mt-2" style={{ fontSize: "16px" }}>
                {v.verseText}
              </p>
              {v.note && (
                <p className="mt-1" style={{ color: "var(--phosphor-dim)" }}>
                  {v.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
