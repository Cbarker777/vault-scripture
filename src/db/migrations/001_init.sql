-- Single-row table tracking which book/chapter the reader last had open.
CREATE TABLE IF NOT EXISTS reader_position (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  book_id TEXT NOT NULL,
  chapter INTEGER NOT NULL
);
