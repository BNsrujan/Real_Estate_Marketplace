import { create } from "zustand";
import { DUMMY_PROPERTIES } from "@/features/properties/data/dummy_properties";

export type SidebarMenuId = "map" | "search" | "saved" | "messages" | "profile";

export interface Property {
  id: string;
  title: string;
  type: string;
  price: string;
  size: string;
  lat: number;
  lng: number;
  district: string;
}

interface SidebarStore {
  // Currently active menu
  activeMenu: SidebarMenuId;
  setActiveMenu: (menu: SidebarMenuId) => void;

  // Detail panel visibility (only relevant for mobile/tablet)
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Selected property (for showing details in the panel)
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;

  // Saved properties (bookmarks)
  savedProperties: Property[];
  setSavedProperties: (props: Property[]) => void;
  addSavedProperty: (prop: Property) => void;
  removeSavedProperty: (id: string) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  activeMenu: "map",
  setActiveMenu: (menu) => set({ activeMenu: menu, selectedPropertyId: null }),

  isPanelOpen: true,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  selectedPropertyId: null,
  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),

  // initialize savedProperties with a small set of dummy properties
  savedProperties: DUMMY_PROPERTIES.slice(0, 6),
  setSavedProperties: (props) => set({ savedProperties: props }),
  addSavedProperty: (prop) =>
    set((state) => ({ savedProperties: [...state.savedProperties, prop] })),
  removeSavedProperty: (id) =>
    set((state) => ({ savedProperties: state.savedProperties.filter((p) => p.id !== id) })),
}));
