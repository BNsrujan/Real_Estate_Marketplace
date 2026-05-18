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
  { id: "map",      title: "Map Explorer",      Icon: Map,            description: "Explore Karnataka properties." },
  { id: "search",   title: "Browse Properties", Icon: Search,         description: "Filter and discover listings." },
  { id: "saved",    title: "Saved Properties",  Icon: Bookmark,       description: "Your bookmarks and recent views." },
  { id: "messages", title: "My Enquiries",       Icon: MessageSquare,  description: "Enquiries you have submitted." },
  { id: "blog",     title: "Blog",              Icon: BookOpen,       description: "Real estate insights and news." },
];

const AUTH_GATED_MENUS: Exclude<MenuId, null>[] = [];

// ─── MD3 Navigation Rail item ─────────────────────────────────────────────────

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
          className="group flex flex-col items-center gap-1 w-full py-1 focus-visible:outline-none"
        >
          {/* MD3 Nav Rail indicator pill */}
          <div
            className={`
              relative flex h-8 w-14 items-center justify-center rounded-full
              transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
              active:scale-95
              ${pressed
                ? "bg-secondary shadow-sm"
                : "bg-transparent hover:bg-muted"
              }
            `}
          >
            <Icon
              size={20}
              className={`transition-colors duration-200 ${
                pressed ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
          </div>
          <span className={`text-[10px] font-medium transition-colors duration-200 leading-none ${
            pressed ? "text-primary" : "text-muted-foreground"
          }`}>
            {item.title.split(" ")[0]}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-foreground border border-border text-background text-xs font-medium px-3 py-1.5 rounded-xl shadow-md z-[1100]"
        >
          {item.title}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const [showSellModal, setShowSellModal] = useState(false);
  const activeMenu      = useSidebarStore((s) => s.activeMenu);
  const setActiveMenu   = useSidebarStore((s) => s.setActiveMenu);
  const isPanelOpen     = useSidebarStore((s) => s.isPanelOpen);
  const openPanel       = useSidebarStore((s) => s.openPanel);
  const togglePanel     = useSidebarStore((s) => s.togglePanel);
  const savedProperties = useSidebarStore((s) => s.savedProperties);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal  = useStore((s) => s.openLoginModal);

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
    [activeMenu, setActiveMenu, openPanel, togglePanel, isAuthenticated, openLoginModal],
  );

  return (
    <>
      {showSellModal && <SellFormModal onClose={() => setShowSellModal(false)} />}

      <div className="hidden md:flex h-screen overflow-hidden w-22 relative z-[800]">
        <Sidebar className="w-22 border-r border-border bg-sidebar flex flex-col items-center py-4">
          <SidebarContent className="px-3 py-4 flex flex-col ">
            <SidebarGroup className="">
              <nav aria-label="Primary navigation">
                <ul className="space-y-1">
                  {SIDEBAR_MENUS.map((menu) => (
                    <SidebarMenuItem
                      key={menu.id}
                      item={menu}
                      active={activeMenu === menu.id}
                      isPanelOpen={isPanelOpen}
                      onActivate={handleMenuActivate}
                    />
                  ))}

                  {/* List Property — MD3 FAB style */}
                  <li className="pt-1">
                    <Tooltip>
                      <TooltipTrigger
                        aria-label="List Property"
                        onClick={() => {
                          if (!isAuthenticated) { openLoginModal(); return; }
                          setShowSellModal(true);
                        }}
                        className="group flex flex-col items-center gap-1 w-full py-1 focus-visible:outline-none"
                      >
                        <div className="relative flex h-8 w-14 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 active:scale-95">
                          <Plus size={20} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-medium text-primary leading-none">List</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-popover border border-border text-background bg-foreground text-xs font-medium px-3 py-1.5 rounded-xl shadow-md z-1100"
                      >
                        List Property
                      </TooltipContent>
                    </Tooltip>
                  </li>
                </ul>
              </nav>
            </SidebarGroup>

            <Separator className="my-3 bg-border flex justify-self-start items-start" />

            {/* Watchlist thumbnails */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="gap-3 flex flex-col py-2">
                {savedProperties.map((property) => (
                  <WatchlistBadge key={property.id} property={property} />
                ))}
              </div>
            </div>

            {/* Logo */}
            <div className="mt-auto rounded-xl overflow-hidden border border-border bg-background flex items-center justify-center">
              <Image
                src="/pics/image.png"
                alt="Logo"
                width={72}
                height={72}
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
