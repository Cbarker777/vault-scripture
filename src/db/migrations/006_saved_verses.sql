-- verse_text is a snapshot copied at save time, not a re-fetch — this is
-- still the pack's own verbatim text, just kept alongside the note so
-- viewing saved verses doesn't need to reload the source book.
CREATE TABLE IF NOT EXISTS saved_verses (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  verse_text TEXT NOT NULL,
  note TEXT,
  saved_at TEXT NOT NULL
);
