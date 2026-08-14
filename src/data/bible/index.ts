import type { Book, BookMeta } from "./types";
import bookIndex from "./index.json";

export const BOOKS: BookMeta[] = bookIndex as BookMeta[];

const bookModules = import.meta.glob<{ default: Book }>("./*.json");

export async function loadBook(bookId: string): Promise<Book> {
  const loader = bookModules[`./${bookId}.json`];
  if (!loader) throw new Error(`Unknown book id: ${bookId}`);
  const mod = await loader();
  return mod.default;
}
