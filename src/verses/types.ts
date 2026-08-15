export type SavedVerse = {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  verseText: string;
  note: string | null;
  savedAt: string;
};
