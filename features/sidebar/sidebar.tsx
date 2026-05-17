"use client";

import { useCallback } from "react";
import { Map, Bookmark, MessageSquare, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
} from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import React from "react";
import { useSidebarStore, type SidebarMenuId } from "./store/sidebar_store";
import { useStore } from "@/shared/store";
import WatchlistBadge from "./watchlist_badge";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

type MenuId = SidebarMenuId;

type SidebarMenu = {
  id: Exclude<MenuId, null>;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const SIDEBAR_MENUS: SidebarMenu[] = [
  {
    id: "map",
    title: "Map Explorer",
    Icon: Map,
    description: "Explore Karnataka properties.",
  },
  {
    id: "search",
    title: "Smart Search",
    Icon: Search,
    description: "Search by filters and landmarks.",
  },
  {
    id: "saved",
    title: "Saved Properties",
    Icon: Bookmark,
    description: "Your bookmarks and recent views.",
  },
  {
    id: "messages",
    title: "Messages",
    Icon: MessageSquare,
    description: "Agent chats and updates.",
  },
];

interface WatchlistItem {
  id: string;
  area: string;
  images: { image: string; alt: string }[];
}

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
  const pressed = active && isPanelOpen;

  return (
    <li>
      <Tooltip>
        <TooltipTrigger
            aria-label={item.title}
            title={item.title}
            onClick={() => onActivate(item.id)}
            className={`group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200   ${
              pressed
                ? "border border-white/20 bg-white/6"
                : "border border-white/10 hover:bg-white/6"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                pressed ? "bg-white/6" : "bg-transparent"
              }`}
            >
              <Icon size={18} />
            </div>
          </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-zinc-900/95 border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm z-1100 [--tooltip-bg:var(--color-zinc-900)]"
        >
          {item.title}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}

const AUTH_GATED_MENUS: Exclude<MenuId, null>[] = ["saved", "messages"];

export function AppSidebar() {
  const activeMenu = useSidebarStore((s) => s.activeMenu);
  const setActiveMenu = useSidebarStore((s) => s.setActiveMenu);
  const isPanelOpen = useSidebarStore((s) => s.isPanelOpen);
  const openPanel = useSidebarStore((s) => s.openPanel);
  const togglePanel = useSidebarStore((s) => s.togglePanel);
  const savedProperties = useSidebarStore((s) => s.savedProperties);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal = useStore((s) => s.openLoginModal);

  const watchlistItems: WatchlistItem[] = savedProperties.map((p) => ({
    id: p.id,
    area: p.district || p.title,
    images:
      (p.imageUrls ?? []).length > 0
        ? p.imageUrls.map((img) => ({ image: img, alt: p.title }))
        : [{ image: p.thumbnailUrl || "/property/image.png", alt: p.title }],
  }));

  const handleMenuActivate = useCallback(
    (id: MenuId) => {
      if (id && AUTH_GATED_MENUS.includes(id) && !isAuthenticated) {
        openLoginModal();
        return;
      }
      if (id === activeMenu) {
        togglePanel();
      } else {
        setActiveMenu(id);
        openPanel();
      }
    },
    [
      activeMenu,
      setActiveMenu,
      openPanel,
      togglePanel,
      isAuthenticated,
      openLoginModal,
    ],
  );

  return (
    <div className="hidden md:flex h-screen overflow-hidden bg-black text-white w-22">
      <Sidebar className="w-22 border-r border-white/10 bg-black/50 backdrop-blur-3xl flex flex-col items-center py-4">
        <SidebarContent className="px-4 py-4">
          <SidebarGroup>
            <nav aria-label="Primary navigation">
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

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="gap-4 flex flex-col py-3">
              {watchlistItems.map((property) => (
                <WatchlistBadge
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          </div>

          <div className="bg-white flex items-end rounded-lg justify-center mt-auto">
            <Image
              src="/pics/image.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

export default AppSidebar;
