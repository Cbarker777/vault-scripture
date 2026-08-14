import type { ItemDef } from "../loot/types";

// Flat data — no item here should require new rendering code. `apply`
// maps directly onto the CSS custom properties defined in tokens.css.
export const ITEMS: ItemDef[] = [
  // Terminal themes — recolor the chrome.
  {
    id: "theme-phosphor-standard",
    slot: "terminal-theme",
    tier: "Common",
    name: "Standard Phosphor",
    flavor: "Factory-issue P1 green. Reliable. Unremarkable.",
    apply: {},
  },
  {
    id: "theme-amber-warning",
    slot: "terminal-theme",
    tier: "Marked",
    name: "Amber Warning Board",
    flavor: "Salvaged from a decommissioned reactor console.",
    apply: { "--phosphor": "#ffb000", "--phosphor-dim": "#8a5c00" },
  },
  {
    id: "theme-cold-blue",
    slot: "terminal-theme",
    tier: "Rare",
    name: "Cold Blue CRT",
    flavor: "Military surplus. Somebody didn't want this seen from orbit.",
    apply: { "--phosphor": "#4fd8ff", "--phosphor-dim": "#1f6b80" },
  },
  {
    id: "theme-ghost-white",
    slot: "terminal-theme",
    tier: "Relic",
    name: "Ghost Terminal",
    flavor: "No manufacturer markings. It was already old when the vault sealed.",
    apply: { "--phosphor": "#f5f5f0", "--phosphor-dim": "#9a9a92" },
  },

  // Reader typefaces — restyle the scripture pane only.
  {
    id: "typeface-garamond",
    slot: "reader-typeface",
    tier: "Common",
    name: "EB Garamond",
    flavor: "The default. Warm and legible.",
    apply: { "--font-serif": "'EB Garamond', Georgia, serif" },
  },
  {
    id: "typeface-cormorant",
    slot: "reader-typeface",
    tier: "Marked",
    name: "Cormorant Garamond",
    flavor: "Taller, quieter, a little more formal.",
    apply: { "--font-serif": "'Cormorant Garamond', Georgia, serif" },
  },
  {
    id: "typeface-georgia",
    slot: "reader-typeface",
    tier: "Rare",
    name: "Pre-War Georgia",
    flavor: "A font that outlasted the company that made it.",
    apply: { "--font-serif": "Georgia, 'Times New Roman', serif" },
  },

  // Holotape stings, desk objects, bookmarks — defined as data per spec;
  // the stash renders them generically for now.
  {
    id: "holotape-hum",
    slot: "holotape",
    tier: "Common",
    name: "Vault Hum Loop",
    flavor: "Thirty seconds of HVAC. Strangely comforting.",
    apply: {},
  },
  {
    id: "holotape-chime",
    slot: "holotape",
    tier: "Rare",
    name: "Overseer's Chime",
    flavor: "Played once, decades ago, to announce something good.",
    apply: {},
  },
  {
    id: "desk-object-mug",
    slot: "desk-object",
    tier: "Common",
    name: "Chipped Mug",
    flavor: "World's Okayest Archivist.",
    apply: {},
  },
  {
    id: "desk-object-lamp",
    slot: "desk-object",
    tier: "Marked",
    name: "Gooseneck Lamp",
    flavor: "The only light in the records room that still works.",
    apply: {},
  },
  {
    id: "desk-object-fern",
    slot: "desk-object",
    tier: "Relic",
    name: "Preserved Fern",
    flavor: "Somehow still green. Nobody asks how.",
    apply: {},
  },
  {
    id: "bookmark-brass",
    slot: "bookmark",
    tier: "Common",
    name: "Brass Ribbon",
    flavor: "Standard issue. Doesn't tarnish.",
    apply: {},
  },
  {
    id: "bookmark-pressed-flower",
    slot: "bookmark",
    tier: "Rare",
    name: "Pressed Flower",
    flavor: "Nobody remembers whose it was.",
    apply: {},
  },
  {
    id: "bookmark-wax-seal",
    slot: "bookmark",
    tier: "Relic",
    name: "Wax Vault Seal",
    flavor: "Unbroken until you broke it.",
    apply: {},
  },
];
