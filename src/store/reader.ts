import { create } from "zustand";
import { getReaderPosition, setReaderPosition } from "../db/adapter";
import { CANONICAL_BOOKS } from "../data/bible/books-meta";

const DEFAULT_BOOK_ID = CANONICAL_BOOKS[0].id;
const DEFAULT_CHAPTER = 1;

type ReaderState = {
  bookId: string;
  chapter: number;
  loaded: boolean;
  hydrate: () => Promise<void>;
  goTo: (bookId: string, chapter: number) => Promise<void>;
};

export const useReaderStore = create<ReaderState>((set) => ({
  bookId: DEFAULT_BOOK_ID,
  chapter: DEFAULT_CHAPTER,
  loaded: false,
  hydrate: async () => {
    const saved = await getReaderPosition();
    set({
      bookId: saved?.bookId ?? DEFAULT_BOOK_ID,
      chapter: saved?.chapter ?? DEFAULT_CHAPTER,
      loaded: true,
    });
  },
  goTo: async (bookId, chapter) => {
    set({ bookId, chapter });
    await setReaderPosition({ bookId, chapter });
  },
}));
