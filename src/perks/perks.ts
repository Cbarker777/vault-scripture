import type { PerkDef } from "./types";

// Data, not branching code — adding a perk here should not require
// touching components, only whatever consumes a given perk's effect.
export const PERKS: PerkDef[] = [
  {
    id: "marginalia",
    name: "Marginalia",
    description: "Reflection notes get a rich-text editor and are searchable.",
  },
  {
    id: "concordance",
    name: "Concordance",
    description: "Cross-references appear inline in the reader.",
  },
  {
    id: "night-shift",
    name: "Night Shift",
    description: "Reading between 2200 and 0500 earns a small XP bonus.",
  },
  {
    id: "cartographer",
    name: "Cartographer",
    description: "Unlocks the map view for narrative books.",
  },
  {
    id: "lectionary",
    name: "Lectionary",
    description: "The daily bounty pays bonus caps.",
  },
];
