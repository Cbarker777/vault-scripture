-- Every credit is a row; balance is the sum. `reason` is a unique source
-- key (e.g. "quest:gen", "streak:7", "bounty:2026-08-13") so a given
-- source can only ever pay out once — INSERT OR IGNORE makes crediting
-- idempotent from the caller's side.
CREATE TABLE IF NOT EXISTS caps_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reason TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
