"use client";

import { Map, Bookmark, MessageSquare, User, Search } from "lucide-react";
import { useSidebarStore, type SidebarMenuId } from "../store/sidebar_store";
import { useStore } from "@/shared/store";

type NavItem = {
  id: Exclude<SidebarMenuId, null>;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { id: "map", label: "Map", Icon: Map },
  { id: "search", label: "Search", Icon: Search },
  { id: "saved", label: "Saved", Icon: Bookmark },
  { id: "messages", label: "Messages", Icon: MessageSquare },
  { id: "profile", label: "Profile", Icon: User },
];

const AUTH_GATED: Exclude<SidebarMenuId, null>[] = ["saved", "messages"];

export default function MobileBottomNav() {
  const activeMenu = useSidebarStore((s) => s.activeMenu);
  const setActiveMenu = useSidebarStore((s) => s.setActiveMenu);
  const isPanelOpen = useSidebarStore((s) => s.isPanelOpen);
  const openPanel = useSidebarStore((s) => s.openPanel);
  const togglePanel = useSidebarStore((s) => s.togglePanel);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal = useStore((s) => s.openLoginModal);

  const handleTap = (id: Exclude<SidebarMenuId, null>) => {
    if (AUTH_GATED.includes(id) && !isAuthenticated) {
      openLoginModal();
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
        md:hidden
        fixed bottom-0 left-0 right-0
        z-50
        flex items-center justify-around
        h-16
        border-t border-white/10
        bg-black/80 backdrop-blur-2xl
        px-2
        pb-safe
      "
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = activeMenu === id && isPanelOpen;
        return (
          <button
            key={id}
            onClick={() => handleTap(id)}
            aria-label={label}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
          >
            <div
              className={`
                flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200
                ${active ? "bg-white/10" : ""}
              `}
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${active ? "text-white" : "text-white/40"}`}
              />
            </div>
            <span
              className={`text-[10px] transition-colors duration-200 ${active ? "text-white" : "text-white/40"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
