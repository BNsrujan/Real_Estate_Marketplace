"use client";

import { useCallback } from "react";
import { Map, Bookmark, MessageSquare, User, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
} from "@/shared/components/ui/sidebar";
import { SidebarCard } from "@/shared/ui/sidebar_card";
import { Separator } from "@/shared/components/ui/separator";
import React from "react";
import { useSidebarStore } from "@/store/sidebar_store";

type MenuId = "map" | "search" | "saved" | "messages" | "profile";

type SidebarMenu = {
  id: MenuId;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const SIDEBAR_MENUS: SidebarMenu[] = [
  { id: "map", title: "Map Explorer", Icon: Map, description: "Explore Karnataka properties." },
  { id: "search", title: "Smart Search", Icon: Search, description: "Search by filters and landmarks." },
  { id: "saved", title: "Saved Properties", Icon: Bookmark, description: "Your bookmarks and recent views." },
  { id: "messages", title: "Messages", Icon: MessageSquare, description: "Agent chats and updates." },
  { id: "profile", title: "Profile", Icon: User, description: "Account settings and preferences." },
];

const properties = [
  { id: 1, image: "/property/image.png", alt: "Property 1" },
  { id: 2, image: "/property/image.png", alt: "Property 2" },
  { id: 3, image: "/property/image.png", alt: "Property 3" },
  { id: 4, image: "/property/image.png", alt: "Property 4" },
];

function SidebarMenuItem({
  item,
  active,
  onActivate,
}: {
  item: SidebarMenu;
  active: boolean;
  onActivate: (id: MenuId) => void;
}) {
  const Icon = item.Icon;
  return (
    <li>
      <button
        aria-label={item.title}
        title={item.title}
        onClick={() => onActivate(item.id)}
        className={`group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200 active:scale-[0.98] ${
          active
            ? "border border-white/20 bg-white/[0.06]"
            : "border border-white/10 hover:bg-white/[0.06]"
        }`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
            active ? "bg-white/[0.06]" : "bg-transparent"
          }`}
        >
          <Icon size={18} />
        </div>
      </button>
    </li>
  );
}

export function AppSidebar() {
  const activeMenu = useSidebarStore((s) => s.activeMenu);
  const setActiveMenu = useSidebarStore((s) => s.setActiveMenu);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = SIDEBAR_MENUS.findIndex((m) => m.id === activeMenu);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveMenu(SIDEBAR_MENUS[(idx + 1) % SIDEBAR_MENUS.length].id);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveMenu(SIDEBAR_MENUS[(idx - 1 + SIDEBAR_MENUS.length) % SIDEBAR_MENUS.length].id);
      }
    },
    [activeMenu, setActiveMenu],
  );

  return (
    <div className="hidden md:flex h-screen overflow-hidden bg-black text-white w-22">
      <Sidebar className="w-22 border-r border-white/10 bg-black/50 backdrop-blur-3xl flex flex-col items-center py-4">
        <SidebarContent className="px-4 py-4">
          <SidebarGroup>
            <nav onKeyDown={onKeyDown} aria-label="Primary navigation">
              <ul className="space-y-3">
                {SIDEBAR_MENUS.map((menu) => (
                  <SidebarMenuItem
                    key={menu.id}
                    item={menu}
                    active={activeMenu === menu.id}
                    onActivate={setActiveMenu}
                  />
                ))}
              </ul>
            </nav>
          </SidebarGroup>

          <Separator className="my-4" />

          <div className="gap-4 flex flex-col h-full w-full overflow-y-auto">
            {properties.map((property) => (
              <SidebarCard key={property.id} className="p-0 cursor-pointer">
                <img
                  src={property.image}
                  alt={property.alt}
                  className="h-10 w-full rounded-md object-cover"
                />
              </SidebarCard>
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

export default AppSidebar;