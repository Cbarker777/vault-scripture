export type Testament = "OT" | "NT";

export type BookGenre = "Law" | "History" | "Wisdom" | "Prophecy" | "Gospel" | "Epistle";

export type Verse = {
  number: number;
  text: string;
};

export type Chapter = {
  number: number;
  verses: Verse[];
  wordCount: number;
};

export type Book = {
  id: string;
  name: string;
  testament: Testament;
  genre: BookGenre;
  chapters: Chapter[];
};

export type BookMeta = {
  id: string;
  name: string;
  testament: Testament;
  genre: BookGenre;
  chapterCount: number;
};
