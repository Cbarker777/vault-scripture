export const LEVEL_EXPONENT = 1.5;

export function xpForLevel(level: number): number {
  return Math.round(100 * level ** LEVEL_EXPONENT);
}

function levelProgress(xp: number): { level: number; xpIntoLevel: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining };
}

export function levelForXp(xp: number): number {
  return levelProgress(xp).level;
}

export function xpIntoCurrentLevel(xp: number): number {
  return levelProgress(xp).xpIntoLevel;
}

export function xpToNextLevel(xp: number): number {
  const { level, xpIntoLevel } = levelProgress(xp);
  return xpForLevel(level) - xpIntoLevel;
}
