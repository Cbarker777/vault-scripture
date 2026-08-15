import type { ComprehensionQuestion } from "./types";

const PASS_THRESHOLD = 2; // out of a 3-question check

export function gradeComprehensionCheck(
  questions: ComprehensionQuestion[],
  answers: number[],
): boolean {
  const correct = questions.reduce(
    (sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0),
    0,
  );
  return correct >= PASS_THRESHOLD;
}
