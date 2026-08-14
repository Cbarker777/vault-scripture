// Pulls the WEB (World English Bible, public domain) text and writes one
// JSON file per book to src/data/bible/{bookId}.json, plus an index.json
// of lightweight book metadata. Run at dev/build time only — the app never
// fetches scripture text at runtime.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CANONICAL_BOOKS } from "../src/data/bible/books-meta.ts";
import type { Book, BookMeta, Chapter } from "../src/data/bible/types.ts";

const SOURCE_URL = "https://api.getbible.net/v2/web.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../src/data/bible");

type SourceVerse = { chapter: number; verse: number; text: string };
type SourceChapter = { chapter: number; name: string; verses: SourceVerse[] };
type SourceBook = { nr: number; name: string; chapters: SourceChapter[] };
type SourcePayload = { books: SourceBook[] };

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

async function main() {
  console.log(`Fetching WEB source from ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch source: ${res.status} ${res.statusText}`);
  }
  const payload = (await res.json()) as SourcePayload;

  if (payload.books.length !== CANONICAL_BOOKS.length) {
    throw new Error(
      `Expected ${CANONICAL_BOOKS.length} books from source, got ${payload.books.length}`,
    );
  }

  await mkdir(OUT_DIR, { recursive: true });

  const index: BookMeta[] = [];

  for (let i = 0; i < CANONICAL_BOOKS.length; i++) {
    const meta = CANONICAL_BOOKS[i];
    const sourceBook = payload.books[i];

    const chapters: Chapter[] = sourceBook.chapters.map((sc) => {
      const verses = sc.verses.map((v) => ({
        number: v.verse,
        text: v.text.trim().replace(/\s+/g, " "),
      }));
      const wordCount = verses.reduce((sum, v) => sum + countWords(v.text), 0);
      return { number: sc.chapter, verses, wordCount };
    });

    const book: Book = {
      id: meta.id,
      name: meta.name,
      testament: meta.testament,
      genre: meta.genre,
      chapters,
    };

    await writeFile(
      path.join(OUT_DIR, `${meta.id}.json`),
      JSON.stringify(book),
      "utf-8",
    );

    index.push({
      id: meta.id,
      name: meta.name,
      testament: meta.testament,
      genre: meta.genre,
      chapterCount: chapters.length,
    });

    console.log(`  wrote ${meta.id}.json (${chapters.length} chapters)`);
  }

  await writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify(index, null, 2),
    "utf-8",
  );

  console.log(`Done. ${index.length} books written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
