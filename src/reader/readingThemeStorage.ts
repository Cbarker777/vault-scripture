import { DEFAULT_READING_THEME_ID, READING_THEMES, type ReadingThemeId } from "./readingThemes";

const STORAGE_KEY = "vault-scripture:reading-theme";

export function getStoredReadingThemeId(): ReadingThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  const match = READING_THEMES.find((t) => t.id === stored);
  return match ? match.id : DEFAULT_READING_THEME_ID;
}

export function setStoredReadingThemeId(id: ReadingThemeId): void {
  localStorage.setItem(STORAGE_KEY, id);
}
