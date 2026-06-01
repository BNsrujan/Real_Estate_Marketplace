"use client";

import { Map, Bookmark, Search, Inbox } from "lucide-react";
import { useSidebarStore, type SidebarMenuId } from "../store/sidebar_store";
import { useStore } from "@/shared/store";

type NavItem = {
  id: Exclude<SidebarMenuId, null>;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { id: "map",      label: "Map",      Icon: Map },
  { id: "search",   label: "Search",   Icon: Search },
  { id: "saved",    label: "Saved",    Icon: Bookmark },
  { id: "messages", label: "Messages", Icon: Inbox },
];

const AUTH_GATED: Exclude<SidebarMenuId, null>[] = ["saved", "messages"];

export default function MobileBottomNav() {
  const activeMenu      = useSidebarStore((s) => s.activeMenu);
  const setActiveMenu   = useSidebarStore((s) => s.setActiveMenu);
  const isPanelOpen     = useSidebarStore((s) => s.isPanelOpen);
  const openPanel       = useSidebarStore((s) => s.openPanel);
  const togglePanel     = useSidebarStore((s) => s.togglePanel);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal  = useStore((s) => s.openLoginModal);
  const selectedProperty = useStore((s) => s.properties.selectedProperty);
  const setSelectedProperty = useStore((s) => s.setSelectedProperty);

  const handleTap = (id: Exclude<SidebarMenuId, null>) => {
    if (AUTH_GATED.includes(id) && !isAuthenticated) {
      openLoginModal();
      return;
    }
    if (selectedProperty) {
      setSelectedProperty(null);
      setActiveMenu(id);
      openPanel();
      return;
    }
    if (id === activeMenu && isPanelOpen) {
      togglePanel();
    } else {
      setActiveMenu(id);
      openPanel();
    }
  };

  return (
    <nav
      className="
        md:hidden fixed bottom-0 left-0 right-0 z-[51]
        flex items-center justify-around
        h-16 px-2 pb-safe
        bg-background border-t border-border
      "
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = activeMenu === id && isPanelOpen;
        return (
          <button
            key={id}
            onClick={() => handleTap(id)}
            aria-label={label}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 focus-visible:outline-none"
          >
            {/* MD3 Nav Bar pill indicator */}
            <div
              className={`
                flex items-center justify-center w-16 h-8 rounded-full
                transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
                active:scale-95
                ${active ? "bg-secondary" : "bg-transparent"}
              `}
            >
              <Icon
                size={22}
                className={`transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
