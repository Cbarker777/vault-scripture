export type ReadingSession = {
  id: string;
  bookId: string;
  chapter: number;
  startedAt: string;
  endedAt: string;
  dwellSeconds: number;
  reflection: string | null;
  comprehensionPassed: boolean | null;
  xpAwarded: number;
  verified: boolean;
};
