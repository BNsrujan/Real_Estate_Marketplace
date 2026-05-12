"use client";

import React, { useCallback } from "react";
import {
  Map,
  Search,
  Bookmark,
  MessageSquare,
  User,
  Settings,
  Sparkles,
} from "lucide-react";

import { useSidebarStore, type SidebarMenuId } from "@/store/sidebar-store";
import { FloatingButton } from "@/shared/ui/FloatingButton";

type MenuIconItem = {
  id: SidebarMenuId;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
};

const MENU_ITEMS: MenuIconItem[] = [
  { id: "map", Icon: Map, label: "Map Explorer" },
  { id: "search", Icon: Search, label: "Smart Search" },
  { id: "saved", Icon: Bookmark, label: "Saved Properties" },
  { id: "messages", Icon: MessageSquare, label: "Messages" },
  { id: "profile", Icon: User, label: "Profile" },
];


export function SidebarIconRail() {
  const { activeMenu, setActiveMenu } = useSidebarStore();

  const handleMenuClick = useCallback(
    (menuId: SidebarMenuId) => {
      setActiveMenu(menuId);
    },
    [setActiveMenu],
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-22.5 border-r border-white/10 bg-black/50 backdrop-blur-3xl flex flex-col items-center py-6 gap-4 z-50">
      {/* Logo/Brand Icon */}
      <div className="mb-4">
        <Sparkles size={24} className="text-white/60" />
      </div>

      {/* Menu Icons */}
      <nav className="flex flex-col gap-3">
        {MENU_ITEMS.map(({ id, Icon, label }) => (
          <FloatingButton
            key={id}
            onClick={() => handleMenuClick(id)}
            size="sm"
            aria-label={label}
            title={label}
            className={`transition-all duration-300 ${
              activeMenu === id
                ? "border-white/20 bg-white/8 text-white ring-2 ring-white/20"
                : "border-white/10 text-white/70 hover:text-white hover:bg-white/6"
            }`}
          >
            <Icon size={20} />
          </FloatingButton>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings Icon at Bottom */}
      <FloatingButton
        size="sm"
        aria-label="Settings"
        title="Settings"
        className="border-white/10 text-white/70 hover:text-white hover:bg-white/6"
      >
        <Settings size={20} />
      </FloatingButton>
    </aside>
  );
}
