// Abstracts persistence behind a small async API. Browser target: sql.js
// (SQLite compiled to wasm) with its binary snapshot persisted in
// IndexedDB after every write. A server target (better-sqlite3) can
// implement the same functions later without touching callers.
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import migration001 from "./migrations/001_init.sql?raw";

const IDB_NAME = "vault-scripture";
const IDB_STORE = "sqlite";
const IDB_KEY = "main";
const IDB_VERSION = 1;

const MIGRATIONS: string[] = [migration001];

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
