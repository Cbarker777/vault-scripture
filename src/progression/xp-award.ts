import { expectedSeconds } from "../session/verify";

const FIRST_READ_MULTIPLIER = 1.5;
const REREAD_MULTIPLIER = 1.0;

export function calculateXpAward(params: {
  verified: boolean;
  wordCount: number;
  dwellSeconds: number;
  firstTimeReadingThisChapter: boolean;
}): number {
  if (!params.verified) return 0;

  const baseXP = Math.ceil(params.wordCount / 25);
  const expected = expectedSeconds(params.wordCount);
  const depthMul = 1.0 + Math.min(params.dwellSeconds / expected - 1, 1.0) * 0.5;
  const firstMul = params.firstTimeReadingThisChapter
    ? FIRST_READ_MULTIPLIER
    : REREAD_MULTIPLIER;

  return Math.round(baseXP * depthMul * firstMul);
}
