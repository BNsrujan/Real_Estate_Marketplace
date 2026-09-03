/**
 * sidebar_store — Compatibility shim over the unified NammaDharaniStore.
 *
 * Existing consumers import from here. New features should use @/shared/store.
 */

import { useStore, type SidebarMenuId } from '@/shared/store';
import type { Property } from '@/shared/types';

export type { SidebarMenuId };

export function useSidebarStore<T>(
  selector: (state: {
    activeMenu: SidebarMenuId;
    setActiveMenu: (menu: SidebarMenuId) => void;
    isPanelOpen: boolean;
    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;
    selectedPropertyId: string | null;
    setSelectedPropertyId: (id: string | null) => void;
    selectedProperty: Property | null;
    setSelectedProperty: (property: Property | null) => void;
    savedProperties: Property[];
    setSavedProperties: (props: Property[]) => void;
    addSavedProperty: (prop: Property) => void;
    removeSavedProperty: (id: string) => void;
  }) => T,
): T {
  return useStore((s) =>
    selector({
      activeMenu: s.ui.activeSidebarTab,
      setActiveMenu: (menu) => {
        s.setActiveSidebarTab(menu);
        if (menu !== null) s.setUI({ isPanelOpen: true });
      },

      isPanelOpen: s.ui.isPanelOpen,
      openPanel: () => s.setUI({ isPanelOpen: true }),
      closePanel: () => s.setUI({ isPanelOpen: false }),
      togglePanel: () => s.setUI({ isPanelOpen: !s.ui.isPanelOpen }),

      selectedPropertyId: s.properties.selectedProperty?.id ?? null,
      setSelectedPropertyId: (id) => {
        if (!id) s.setSelectedProperty(null);
      },

      selectedProperty: s.properties.selectedProperty,
      setSelectedProperty: s.setSelectedProperty,

      savedProperties: s.watchlist.saved,
      setSavedProperties: (props) => s.setWatchlist({ saved: props }),
      addSavedProperty: s.addToWatchlist,
      removeSavedProperty: s.removeFromWatchlist,
    }),
  );
}
