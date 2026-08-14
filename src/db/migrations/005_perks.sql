-- One perk pick per level; level is the primary key so a level can only
-- ever record one selection.
CREATE TABLE IF NOT EXISTS perks_selected (
  level INTEGER PRIMARY KEY,
  perk_id TEXT NOT NULL,
  selected_at TEXT NOT NULL
);
