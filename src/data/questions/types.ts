export type ComprehensionQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
};

export type ChapterQuestions = {
  chapter: number;
  questions: ComprehensionQuestion[];
};
