import { READING_THEMES, type ReadingThemeId } from "./readingThemes";

export function applyReadingTheme(id: ReadingThemeId): void {
  const theme = READING_THEMES.find((t) => t.id === id) ?? READING_THEMES[0];
  const root = document.documentElement.style;
  root.setProperty("--reading-bg", theme.bg);
  root.setProperty("--reading-fg", theme.fg);
}
