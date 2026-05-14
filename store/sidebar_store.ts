import { create } from "zustand";
import type { Property } from "@/shared/types";

export type SidebarMenuId = "map" | "search" | "saved" | "messages" | "profile" | null;

interface SidebarStore {
  activeMenu: SidebarMenuId;
  setActiveMenu: (menu: SidebarMenuId) => void;

  // Detail panel visibility
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;

  savedProperties: Property[];
  setSavedProperties: (props: Property[]) => void;
  addSavedProperty: (prop: Property) => void;
  removeSavedProperty: (id: string) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  activeMenu: null,
  setActiveMenu: (menu) => set({ activeMenu: menu, selectedPropertyId: null }),

  isPanelOpen: false,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  selectedPropertyId: null,
  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),

  savedProperties: [],
  setSavedProperties: (props) => set({ savedProperties: props }),
  addSavedProperty: (prop) =>
    set((state) => ({ savedProperties: [...state.savedProperties, prop] })),
  removeSavedProperty: (id) =>
    set((state) => ({
      savedProperties: state.savedProperties.filter((p) => p.id !== id),
    })),
}));
