import { create } from "zustand";

export type SidebarMenuId = "map" | "search" | "saved" | "messages" | "profile";

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
}));
