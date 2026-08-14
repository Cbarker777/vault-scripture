const WPM_CEILING = 240;
const REFLECTION_MIN_WORDS = 15;

export function expectedSeconds(wordCount: number): number {
  return (wordCount / WPM_CEILING) * 60;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export function isVerified(params: {
  dwellSeconds: number;
  wordCount: number;
  scrollCompleted: boolean;
  reflection: string | null;
  comprehensionPassed: boolean | null;
}): boolean {
  const dwellOk = params.dwellSeconds >= expectedSeconds(params.wordCount);
  if (!dwellOk || !params.scrollCompleted) return false;

  if (params.comprehensionPassed !== null) return params.comprehensionPassed;
  return countWords(params.reflection ?? "") >= REFLECTION_MIN_WORDS;
}
