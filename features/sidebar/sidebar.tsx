"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Map, Bookmark, MessageSquare, User, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
} from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import React from "react";
import { useSidebarStore, type SidebarMenuId } from "./store/sidebar_store";
import WatchlistBadge from "./watchlist_badge";
import Image from "next/image";

type MenuId = SidebarMenuId;

type SidebarMenu = {
  id: Exclude<MenuId, null>;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const SIDEBAR_MENUS: SidebarMenu[] = [
  { id: "map", title: "Map Explorer", Icon: Map, description: "Explore Karnataka properties." },
  { id: "search", title: "Smart Search", Icon: Search, description: "Search by filters and landmarks." },
  { id: "saved", title: "Saved Properties", Icon: Bookmark, description: "Your bookmarks and recent views." },
  { id: "messages", title: "Messages", Icon: MessageSquare, description: "Agent chats and updates." },
];

interface WatchlistItem {
  id: string;
  area: string;
  images: { image: string; alt: string }[];
}

function WatchlistPreview({
  property,
  pos,
  onClose,
}: {
  property: WatchlistItem;
  pos: { top: number; left: number };
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-90" onClick={onClose} />
      <div
        className="fixed z-100 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-4 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left-2"
        style={{ top: pos.top, left: pos.left, transform: "translateY(-20%)" }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-white">{property.area}</p>
          <div className="flex gap-2 flex-wrap">
            {property.images.map((img, i) => (
              <img
                key={i}
                src={img.image}
                alt={img.alt}
                className="h-12 w-12 rounded-lg object-cover border border-white/5"
              />
            ))}
          </div>
        </div>
        <div className="absolute -left-1.5 top-8 w-3 h-3 bg-black/80 border-l border-b border-white/10 transform rotate-45" />
      </div>
    </>,
    document.body,
  );
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
      <button
        aria-label={item.title}
        title={item.title}
        onClick={() => onActivate(item.id)}
        className={`group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200 active:scale-[0.98] ${
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
  const savedProperties = useSidebarStore((s) => s.savedProperties);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const watchlistItems: WatchlistItem[] = savedProperties.map((p) => ({
    id: p.id,
    area: p.district || p.title,
    images: (p.images ?? []).length > 0
      ? (p.images as string[]).map((img) => ({ image: img, alt: p.title }))
      : [{ image: "/property/image.png", alt: p.title }],
  }));

  const handleMenuActivate = useCallback(
    (id: MenuId) => {
      if (id === activeMenu) {
        togglePanel();
      } else {
        setActiveMenu(id);
        openPanel();
      }
    },
    [activeMenu, setActiveMenu, openPanel, togglePanel],
  );

  const handleBadgeClick = (e: React.MouseEvent, id: string) => {
    if (selectedPropertyId === id) {
      setSelectedPropertyId(null);
      setPopupPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelectedPropertyId(id);
      setPopupPos({ top: rect.top, left: rect.right + 20 });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || selectedPropertyId === null) return;

    const handleScroll = () => {
      setSelectedPropertyId(null);
      setPopupPos(null);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedPropertyId]);

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

          <div className="relative overflow-visible flex-1">
            <div
              ref={scrollContainerRef}
              className="gap-4 flex flex-col h-full w-full overflow-y-auto no-scrollbar py-3"
            >
              {watchlistItems.map((property) => (
                <WatchlistBadge
                  key={property.id}
                  property={property}
                  isSelected={selectedPropertyId === property.id}
                  onClick={(e) => handleBadgeClick(e, property.id)}
                />
              ))}
            </div>

            {selectedPropertyId !== null && popupPos && (() => {
              const item = watchlistItems.find((p) => p.id === selectedPropertyId);
              return item ? (
                <WatchlistPreview
                  property={item}
                  pos={popupPos}
                  onClose={() => {
                    setSelectedPropertyId(null);
                    setPopupPos(null);
                  }}
                />
              ) : null;
            })()}
          </div>

          <div className="bg-white flex items-end rounded-lg justify-center mt-auto">
            <Image src="/pics/image.png" alt="Logo" width={80} height={80} className="object-contain" />
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

export default AppSidebar;
