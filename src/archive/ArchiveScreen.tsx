import { useEffect, useMemo, useState } from "react";
import { BOOKS } from "../data/bible";
import { listReadingSessions } from "../db/adapter";
import type { ReadingSession } from "../session/types";

function bookName(bookId: string): string {
  return BOOKS.find((b) => b.id === bookId)?.name ?? bookId;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function ArchiveScreen() {
  const [sessions, setSessions] = useState<ReadingSession[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void listReadingSessions().then(setSessions);
  }, []);

  const filtered = useMemo(() => {
    if (!sessions) return [];
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        bookName(s.bookId).toLowerCase().includes(q) ||
        (s.reflection ?? "").toLowerCase().includes(q),
    );
  }, [sessions, query]);

  if (sessions === null) {
    return (
      <div className="chrome chrome-label min-h-screen px-8 py-10 text-sm">
        Loading archive…
      </div>
    );
  }

  return (
    <div className="chrome min-h-screen px-8 py-10 text-sm">
      <h1 className="chrome-label mb-6 text-lg" style={{ color: "var(--amber)" }}>
        Archive
      </h1>

      {sessions.length > 0 && (
        <input
          type="text"
          placeholder="SEARCH BOOK OR REFLECTION"
          className="chrome-label mb-6 w-full max-w-md border border-current bg-transparent px-2 py-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {sessions.length === 0 ? (
        <p className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          Archive empty — log a session to add an entry.
        </p>
      ) : filtered.length === 0 ? (
        <p className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          No entries match that search.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((s) => (
            <li key={s.id} className="border-t border-current pt-3">
              <div className="chrome-label" style={{ color: "var(--amber)" }}>
                {bookName(s.bookId)} {s.chapter} — {formatDate(s.endedAt)}
              </div>
              <div className="mt-1" style={{ color: "var(--phosphor-dim)" }}>
                {s.verified ? "Verified" : "Not verified"} · {s.dwellSeconds}s dwell ·{" "}
                {s.xpAwarded} XP
              </div>
              {s.reflection && (
                <p className="reading-pane mt-2" style={{ fontSize: "16px" }}>
                  {s.reflection}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
