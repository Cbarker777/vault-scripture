CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  def_id TEXT NOT NULL,
  acquired_at TEXT NOT NULL,
  equipped INTEGER NOT NULL DEFAULT 0
);
