import type { ComprehensionQuestion } from "./types";

const CHECK_SIZE = 3;

// Randomly samples CHECK_SIZE questions from however many are authored
// (3-5), so repeat attempts on the same chapter see some variety.
export function pickQuestions(
  all: ComprehensionQuestion[],
  random: () => number = Math.random,
): ComprehensionQuestion[] {
  if (all.length <= CHECK_SIZE) return all;

  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, CHECK_SIZE);
}
