export type ReadingThemeId = "vault" | "parchment" | "high-contrast" | "dim" | "terminal";

export type ReadingTheme = {
  id: ReadingThemeId;
  name: string;
  bg: string;
  fg: string;
};

// A free accessibility setting, not loot — readability shouldn't depend
// on a random drop. Separate from the equippable "terminal-theme" loot
// category, which only recolors the chrome.
export const READING_THEMES: ReadingTheme[] = [
  { id: "vault", name: "Vault (default)", bg: "#0a0d0a", fg: "#ded6c3" },
  { id: "parchment", name: "Parchment", bg: "#f4ecd8", fg: "#2b2620" },
  { id: "high-contrast", name: "High Contrast", bg: "#ffffff", fg: "#000000" },
  { id: "dim", name: "Dim", bg: "#1a1a1a", fg: "#c8c8c8" },
  { id: "terminal", name: "Terminal", bg: "#0a0d0a", fg: "#3ee66b" },
];

export const DEFAULT_READING_THEME_ID: ReadingThemeId = "vault";
