import { create } from "zustand";

type GameEventsState = {
  levelUpTo: number | null;
  perkPickLevel: number | null;
  announceLevelUp: (level: number) => void;
  clearLevelUp: () => void;
  requestPerkPick: (level: number) => void;
  clearPerkPick: () => void;
};

export const useGameEventsStore = create<GameEventsState>((set) => ({
  levelUpTo: null,
  perkPickLevel: null,
  announceLevelUp: (level) => set({ levelUpTo: level }),
  clearLevelUp: () => set({ levelUpTo: null }),
  requestPerkPick: (level) => set({ perkPickLevel: level }),
  clearPerkPick: () => set({ perkPickLevel: null }),
}));
