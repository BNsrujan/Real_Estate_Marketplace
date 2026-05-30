"use client";

import { useState } from "react";
import {
  Map,
  Bookmark,
  Search,
  MessageSquare,
  BookOpen,
  Plus,
} from "lucide-react";
import { useSidebarStore, type SidebarMenuId } from "../store/sidebar_store";
import { useStore } from "@/shared/store";
import { SellFormModal } from "@/features/sell/components/sell_form_modal";

type MobileNavId = Exclude<SidebarMenuId, null> | "list";

type NavItem = {
  id: MobileNavId;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { id: "map",      label: "Map",       Icon: Map },
  { id: "search",   label: "Browse",    Icon: Search },
  { id: "saved",    label: "Saved",     Icon: Bookmark },
  { id: "messages", label: "Enquiries", Icon: MessageSquare },
  { id: "blog",     label: "Blog",      Icon: BookOpen },
  { id: "list",     label: "List",      Icon: Plus },
];

export default function MobileBottomNav() {
  const [showSellModal, setShowSellModal] = useState(false);
  const activeMenu      = useSidebarStore((s) => s.activeMenu);
  const setActiveMenu   = useSidebarStore((s) => s.setActiveMenu);
  const isPanelOpen     = useSidebarStore((s) => s.isPanelOpen);
  const openPanel       = useSidebarStore((s) => s.openPanel);
  const togglePanel     = useSidebarStore((s) => s.togglePanel);
  const selectedProperty = useSidebarStore((s) => s.selectedProperty);
  const setSelectedProperty = useSidebarStore((s) => s.setSelectedProperty);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal  = useStore((s) => s.openLoginModal);

  const handleTap = (id: MobileNavId) => {
    if (id === "list") {
      if (!isAuthenticated) {
        openLoginModal();
        return;
      }
      setShowSellModal(true);
      return;
    }

    if (selectedProperty) {
      setSelectedProperty(null);
    }

    if (id === activeMenu && isPanelOpen) {
      togglePanel();
    } else {
      setActiveMenu(id);
      openPanel();
    }
  };

  return (
    <>
      {showSellModal && (
        <SellFormModal onClose={() => setShowSellModal(false)} />
      )}

      <nav
        className="
          md:hidden fixed bottom-0 left-0 right-0 z-[51]
          flex items-center justify-around
          h-16 px-1 pb-safe
          bg-background border-t border-border
        "
      >
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = id !== "list" && activeMenu === id && isPanelOpen;
          return (
            <button
              key={id}
              onClick={() => handleTap(id)}
              aria-label={label}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 focus-visible:outline-none"
            >
              {/* MD3 Nav Bar pill indicator */}
              <div
                className={`
                  flex h-8 w-11 items-center justify-center rounded-full
                  transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
                  active:scale-95
                  ${active ? "bg-secondary" : "bg-transparent"}
                `}
              >
                <Icon
                  size={21}
                  className={`transition-colors duration-200 ${
                    active || id === "list" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`max-w-full truncate text-[9px] font-medium leading-tight transition-colors duration-200 ${
                  active || id === "list" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
