"use client";

import { useCallback, useState } from "react";
import { Map, Bookmark, MessageSquare, Search, BookOpen, Plus } from "lucide-react";
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
import { SellFormModal } from "@/features/sell/components/sell_form_modal";

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
    title: "Browse Properties",
    Icon: Search,
    description: "Filter and discover listings.",
  },
  {
    id: "saved",
    title: "Saved Properties",
    Icon: Bookmark,
    description: "Your bookmarks and recent views.",
  },
  {
    id: "messages",
    title: "My Enquiries",
    Icon: MessageSquare,
    description: "Enquiries you have submitted.",
  },
  {
    id: "blog",
    title: "Blog",
    Icon: BookOpen,
    description: "Real estate insights and news.",
  },
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

// These menus show a login CTA inside the panel rather than immediately blocking
const AUTH_GATED_MENUS: Exclude<MenuId, null>[] = [];

export function AppSidebar() {
  const [showSellModal, setShowSellModal] = useState(false);
  const activeMenu = useSidebarStore((s) => s.activeMenu);
  const setActiveMenu = useSidebarStore((s) => s.setActiveMenu);
  const isPanelOpen = useSidebarStore((s) => s.isPanelOpen);
  const openPanel = useSidebarStore((s) => s.openPanel);
  const togglePanel = useSidebarStore((s) => s.togglePanel);
  const savedProperties = useSidebarStore((s) => s.savedProperties);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal = useStore((s) => s.openLoginModal);


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
    <>
      {showSellModal && <SellFormModal onClose={() => setShowSellModal(false)} />}
      <div className="hidden md:flex h-screen overflow-hidden bg-black text-white w-22 relative z-[800]">
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

                {/* List Property button */}
                <li>
                  <Tooltip>
                    <TooltipTrigger
                      aria-label="List Property"
                      onClick={() => {
                        if (!isAuthenticated) { openLoginModal(); return; }
                        setShowSellModal(true);
                      }}
                      className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-200"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-emerald-400">
                        <Plus size={20} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-zinc-900/95 border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm z-1100"
                    >
                      List Property
                    </TooltipContent>
                  </Tooltip>
                </li>
              </ul>
            </nav>
          </SidebarGroup>

          <Separator className="my-4" />

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="gap-4 flex flex-col py-3">
              {savedProperties.map((property) => (
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
    </>
  );
}

export default AppSidebar;
