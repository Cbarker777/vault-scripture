// Abstracts persistence behind a small async API. Browser target: sql.js
// (SQLite compiled to wasm) with its binary snapshot persisted in
// IndexedDB after every write. A server target (better-sqlite3) can
// implement the same functions later without touching callers.
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import migration001 from "./migrations/001_init.sql?raw";
import migration002 from "./migrations/002_reading_sessions.sql?raw";
import migration003 from "./migrations/003_caps_ledger.sql?raw";
import migration004 from "./migrations/004_inventory.sql?raw";
import migration005 from "./migrations/005_perks.sql?raw";
import migration006 from "./migrations/006_saved_verses.sql?raw";
import type { InventoryItem } from "../loot/types";
import type { PerkId, SelectedPerk } from "../perks/types";
import type { ReadingSession } from "../session/types";
import type { SavedVerse } from "../verses/types";

const IDB_NAME = "vault-scripture";
const IDB_STORE = "sqlite";
const IDB_KEY = "main";
const IDB_VERSION = 1;

const MIGRATIONS: string[] = [
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
  migration006,
];

let sqlPromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;

function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  }
  return sqlPromise;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadSnapshot(): Promise<Uint8Array | null> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => resolve((req.result as Uint8Array | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function saveSnapshot(data: Uint8Array): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(data, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function openDb(): Promise<Database> {
  const SQL = await getSql();
  const snapshot = await loadSnapshot();
  const db = snapshot ? new SQL.Database(snapshot) : new SQL.Database();
  for (const migration of MIGRATIONS) {
    db.run(migration);
  }
  return db;
}

function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = openDb();
  return dbPromise;
}

async function persist(db: Database): Promise<void> {
  await saveSnapshot(db.export());
}

export type ReaderPosition = { bookId: string; chapter: number };

export async function getReaderPosition(): Promise<ReaderPosition | null> {
  const db = await getDb();
  const res = db.exec("SELECT book_id, chapter FROM reader_position WHERE id = 1");
  if (res.length === 0 || res[0].values.length === 0) return null;
  const [bookId, chapter] = res[0].values[0];
  return { bookId: String(bookId), chapter: Number(chapter) };
}

export async function setReaderPosition(position: ReaderPosition): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO reader_position (id, book_id, chapter) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET book_id = excluded.book_id, chapter = excluded.chapter`,
    [position.bookId, position.chapter],
  );
  await persist(db);
}

export async function logReadingSession(session: ReadingSession): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO reading_sessions
       (id, book_id, chapter, started_at, ended_at, dwell_seconds, reflection, comprehension_passed, xp_awarded, verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.bookId,
      session.chapter,
      session.startedAt,
      session.endedAt,
      session.dwellSeconds,
      session.reflection,
      session.comprehensionPassed === null ? null : session.comprehensionPassed ? 1 : 0,
      session.xpAwarded,
      session.verified ? 1 : 0,
    ],
  );
  await persist(db);
}

export async function listReadingSessions(): Promise<ReadingSession[]> {
  const db = await getDb();
  const res = db.exec(
    `SELECT id, book_id, chapter, started_at, ended_at, dwell_seconds, reflection,
            comprehension_passed, xp_awarded, verified
     FROM reading_sessions
     ORDER BY ended_at DESC`,
  );
  if (res.length === 0) return [];

  return res[0].values.map((row) => {
    const [id, bookId, chapter, startedAt, endedAt, dwellSeconds, reflection, comprehensionPassed, xpAwarded, verified] =
      row;
    return {
      id: String(id),
      bookId: String(bookId),
      chapter: Number(chapter),
      startedAt: String(startedAt),
      endedAt: String(endedAt),
      dwellSeconds: Number(dwellSeconds),
      reflection: reflection === null ? null : String(reflection),
      comprehensionPassed: comprehensionPassed === null ? null : Boolean(comprehensionPassed),
      xpAwarded: Number(xpAwarded),
      verified: Boolean(verified),
    };
  });
}

export async function hasReadChapterBefore(bookId: string, chapter: number): Promise<boolean> {
  const db = await getDb();
  const res = db.exec(
    "SELECT 1 FROM reading_sessions WHERE book_id = ? AND chapter = ? LIMIT 1",
    [bookId, chapter],
  );
  return res.length > 0 && res[0].values.length > 0;
}

// Returns true if this credit was newly applied (false if `reason` had
// already been credited before, making repeated calls safe/idempotent).
export async function creditCaps(reason: string, amount: number, at: string): Promise<boolean> {
  const db = await getDb();
  db.run("INSERT OR IGNORE INTO caps_ledger (reason, amount, created_at) VALUES (?, ?, ?)", [
    reason,
    amount,
    at,
  ]);
  const applied = db.getRowsModified() > 0;
  if (applied) await persist(db);
  return applied;
}

export async function getCapsBalance(): Promise<number> {
  const db = await getDb();
  const res = db.exec("SELECT COALESCE(SUM(amount), 0) FROM caps_ledger");
  return Number(res[0].values[0][0]);
}

export async function addInventoryItem(item: InventoryItem): Promise<void> {
  const db = await getDb();
  db.run(
    "INSERT INTO inventory_items (id, def_id, acquired_at, equipped) VALUES (?, ?, ?, ?)",
    [item.id, item.defId, item.acquiredAt, item.equipped ? 1 : 0],
  );
  await persist(db);
}

export async function listInventoryItems(): Promise<InventoryItem[]> {
  const db = await getDb();
  const res = db.exec(
    "SELECT id, def_id, acquired_at, equipped FROM inventory_items ORDER BY acquired_at DESC",
  );
  if (res.length === 0) return [];
  return res[0].values.map(([id, defId, acquiredAt, equipped]) => ({
    id: String(id),
    defId: String(defId),
    acquiredAt: String(acquiredAt),
    equipped: Boolean(equipped),
  }));
}

export async function setItemEquipped(id: string, equipped: boolean): Promise<void> {
  const db = await getDb();
  db.run("UPDATE inventory_items SET equipped = ? WHERE id = ?", [equipped ? 1 : 0, id]);
  await persist(db);
}

export async function selectPerk(level: number, perkId: PerkId, at: string): Promise<void> {
  const db = await getDb();
  db.run("INSERT OR IGNORE INTO perks_selected (level, perk_id, selected_at) VALUES (?, ?, ?)", [
    level,
    perkId,
    at,
  ]);
  await persist(db);
}

export async function listSelectedPerks(): Promise<SelectedPerk[]> {
  const db = await getDb();
  const res = db.exec("SELECT level, perk_id, selected_at FROM perks_selected ORDER BY level ASC");
  if (res.length === 0) return [];
  return res[0].values.map(([level, perkId, selectedAt]) => ({
    level: Number(level),
    perkId: String(perkId) as PerkId,
    selectedAt: String(selectedAt),
  }));
}

export async function saveVerse(verse: SavedVerse): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO saved_verses (id, book_id, chapter, verse, verse_text, note, saved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      verse.id,
      verse.bookId,
      verse.chapter,
      verse.verse,
      verse.verseText,
      verse.note,
      verse.savedAt,
    ],
  );
  await persist(db);
}

export async function listSavedVerses(): Promise<SavedVerse[]> {
  const db = await getDb();
  const res = db.exec(
    `SELECT id, book_id, chapter, verse, verse_text, note, saved_at
     FROM saved_verses
     ORDER BY saved_at DESC`,
  );
  if (res.length === 0) return [];
  return res[0].values.map(([id, bookId, chapter, verse, verseText, note, savedAt]) => ({
    id: String(id),
    bookId: String(bookId),
    chapter: Number(chapter),
    verse: Number(verse),
    verseText: String(verseText),
    note: note === null ? null : String(note),
    savedAt: String(savedAt),
  }));
}

export async function deleteSavedVerse(id: string): Promise<void> {
  const db = await getDb();
  db.run("DELETE FROM saved_verses WHERE id = ?", [id]);
  await persist(db);
}
