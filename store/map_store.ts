import { create } from "zustand";

interface MapStore {
  activeLayer: string;
  setActiveLayer: (layer: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  activeLayer: "terrain",
  setActiveLayer: (layer) => set({ activeLayer: layer }),
}));
