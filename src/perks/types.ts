export type PerkId = "marginalia" | "concordance" | "night-shift" | "cartographer" | "lectionary";

export type PerkDef = {
  id: PerkId;
  name: string;
  description: string;
};

export type SelectedPerk = {
  level: number;
  perkId: PerkId;
  selectedAt: string;
};
