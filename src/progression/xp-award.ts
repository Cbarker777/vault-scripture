import { expectedSeconds } from "../session/verify";

const FIRST_READ_MULTIPLIER = 1.5;
const REREAD_MULTIPLIER = 1.0;
// Night Shift perk: "a small XP bonus" for reading 2200-0500 local time.
const NIGHT_SHIFT_MULTIPLIER = 1.1;

export function calculateXpAward(params: {
  verified: boolean;
  wordCount: number;
  dwellSeconds: number;
  firstTimeReadingThisChapter: boolean;
  nightShiftBonus?: boolean;
}): number {
  if (!params.verified) return 0;

  const baseXP = Math.ceil(params.wordCount / 25);
  const expected = expectedSeconds(params.wordCount);
  const depthMul = 1.0 + Math.min(params.dwellSeconds / expected - 1, 1.0) * 0.5;
  const firstMul = params.firstTimeReadingThisChapter
    ? FIRST_READ_MULTIPLIER
    : REREAD_MULTIPLIER;
  const nightShiftMul = params.nightShiftBonus ? NIGHT_SHIFT_MULTIPLIER : 1.0;

  return Math.round(baseXP * depthMul * firstMul * nightShiftMul);
}
