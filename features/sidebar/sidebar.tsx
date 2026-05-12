"use client";

import { useCallback, useState } from "react";
import { Map, Bookmark, MessageSquare, User, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
} from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import React from "react";
import { useSidebarStore } from "@/store/sidebar_store";
import WatchlistBadge from "./watchlist_badge";

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
  { id: 1, area: "Bengaluru", images: [{ image: "/property/image.png", alt: "Property 1" }, { image: "/property/image.png", alt: "Property 1" }] },
  { id: 2, area: "Mysore", images: [{ image: "/property/image.png", alt: "Property 2" }, { image: "/property/image.png", alt: "Property 2" }] },
  { id: 3, area: "Hubli", images: [{ image: "/property/image.png", alt: "Property 3" }, { image: "/property/image.png", alt: "Property 3" }] },
  { id: 4, area: "Mangalore", images: [{ image: "/property/image.png", alt: "Property 4" }, { image: "/property/image.png", alt: "Property 4" }] },
];

function SidebarMenuItem({
  item,
  active,
  isPanelOpen,
  onActivate,
}: {
  item: SidebarMenu;
  active: boolean;
  isPanelOpen: boolean;
  onActivate: (id: MenuId) => void;
}) {
  const Icon = item.Icon;
  // visually "pressed" only when active AND panel is open
  const pressed = active && isPanelOpen;

  return (
    <li>
      <button
        aria-label={item.title}
        title={item.title}
        onClick={() => onActivate(item.id)}
        className={`group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200 active:scale-[0.98] ${pressed
            ? "border border-white/20 bg-white/[0.06]"
            : "border border-white/10 hover:bg-white/[0.06]"
          }`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${pressed ? "bg-white/[0.06]" : "bg-transparent"
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
  const isPanelOpen = useSidebarStore((s) => s.isPanelOpen);
  const openPanel = useSidebarStore((s) => s.openPanel);
  const togglePanel = useSidebarStore((s) => s.togglePanel);

  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const handleMenuActivate = useCallback(
    (id: MenuId) => {
      if (id === activeMenu) {
        togglePanel();   // same item → toggle
      } else {
        setActiveMenu(id);
        openPanel();     // new item → always open
      }
    },
    [activeMenu, setActiveMenu, openPanel, togglePanel],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = SIDEBAR_MENUS.findIndex((m) => m.id === activeMenu);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleMenuActivate(SIDEBAR_MENUS[(idx + 1) % SIDEBAR_MENUS.length].id);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleMenuActivate(SIDEBAR_MENUS[(idx - 1 + SIDEBAR_MENUS.length) % SIDEBAR_MENUS.length].id);
      }
    },
    [activeMenu, handleMenuActivate],
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
                    isPanelOpen={isPanelOpen}
                    onActivate={handleMenuActivate}
                  />
                ))}
              </ul>
            </nav>
          </SidebarGroup>

          <Separator className="my-4" />

          <div className="relative overflow-visible">
            <div className="gap-4 flex flex-col h-full w-full overflow-y-auto py-3">
              {properties.map((property) => (
                <WatchlistBadge
                  key={property.id}
                  property={property}
                  isSelected={selectedProperty === property.id}
                  onClick={() =>
                    setSelectedProperty(
                      selectedProperty === property.id ? null : property.id
                    )
                  }
                />
              ))}
            </div>

            {/* {selectedProperty !== null && (
              <div className="absolute left-0 top-0 ml-3 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-4 shadow-xl transition-all duration-200 z-50">
                {(() => {
                  const p = properties.find((p) => p.id === selectedProperty);
                  return p ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-semibold text-white">{p.area}</p>
                      <div className="flex gap-2 flex-wrap">
                        {p.images.map((img: any, i: number) => (
                          <img
                            key={i}
                            src={img.image}
                            alt={img.alt}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )} */}
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

export default AppSidebar;