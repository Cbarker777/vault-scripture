import type { ChapterQuestions, ComprehensionQuestion } from "./types";

// Only books with an authored questions.json show up here — most books
// have none yet, which is expected. Callers treat a null result as "no
// comprehension check for this chapter" and fall back to reflection.
const questionModules = import.meta.glob<{ default: ChapterQuestions[] }>("./*.json");

export async function loadChapterQuestions(
  bookId: string,
  chapter: number,
): Promise<ComprehensionQuestion[] | null> {
  const loader = questionModules[`./${bookId}.json`];
  if (!loader) return null;

  const mod = await loader();
  const entry = mod.default.find((c) => c.chapter === chapter);
  return entry ? entry.questions : null;
}
