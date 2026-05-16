"use client";

import React, { useMemo } from "react";
import {
  Map,
  Search,
  Bookmark,
  MessageSquare,
  User,
  Bell,
  Activity,
  TrendingUp,
  Inbox,
  X,
  ChevronUp,
} from "lucide-react";
import { useSidebarStore } from "../store/sidebar_store";
import { SidebarCard } from "@/shared/ui/sidebar_card";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/shared/components/ui/drawer";

type MenuContent = {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const MENU_CONTENT: Record<string, MenuContent> = {
  map: {
    id: "map",
    title: "Map Explorer",
    description: "Explore Karnataka properties with interactive layers.",
    Icon: Map,
  },
  search: {
    id: "search",
    title: "Smart Search",
    description: "Search properties by filters, location, and landmarks.",
    Icon: Search,
  },
  saved: {
    id: "saved",
    title: "Saved Properties",
    description: "Your bookmarked properties and recent views.",
    Icon: Bookmark,
  },
  messages: {
    id: "messages",
    title: "Messages",
    description: "Chat with agents and property owners.",
    Icon: Inbox,
  },
};

export default function MobileBottomDrawer() {
  const activeMenu = useSidebarStore((s) => s.activeMenu);
  const isPanelOpen = useSidebarStore((s) => s.isPanelOpen);
  const closePanel = useSidebarStore((s) => s.closePanel);

  const menuData = useMemo(() => {
    if (!activeMenu) return null;
    return MENU_CONTENT[activeMenu as string];
  }, [activeMenu]);

  return (
    <Drawer open={isPanelOpen} onOpenChange={closePanel} direction="bottom">
      <DrawerContent 
        className="bg-black/95 border-t border-white/10 backdrop-blur-3xl rounded-t-2xl md:hidden max-h-[70vh] pb-20"
        style={{ bottom: '4rem' }}
      >

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 pt-2 pb-4">
          {/* Hero Section */}
          <div className="mb-6">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/2 backdrop-blur-xl">
              {menuData && <menuData.Icon size={28} className="text-white" />}
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">
              {menuData?.title}
            </h2>
            <p className="text-sm leading-relaxed text-white/55">
              {menuData?.description}
            </p>
          </div>

          {/* Dynamic Content by Menu */}
          <div className="space-y-3">
            {/* MAP EXPLORER */}
            {activeMenu === "map" && (
              <>
                {[
                  "Live Property Layers",
                  "Nearby Infrastructure",
                  "Satellite Intelligence",
                ].map((title) => (
                  <SidebarCard key={title} className="p-4">
                    <h3 className="mb-2 font-semibold text-white text-sm">
                      {title}
                    </h3>
                    <p className="text-xs leading-relaxed text-white/50">
                      Advanced real estate visualization powered by Karnataka
                      geo-spatial intelligence.
                    </p>
                  </SidebarCard>
                ))}
              </>
            )}

            {/* SMART SEARCH */}
            {activeMenu === "search" && (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
                  <Search size={16} className="text-white/40 shrink-0" />
                  <input
                    placeholder="Search properties..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {["Under ₹50L", "Villa", "Apartment", "Commercial"].map(
                    (item) => (
                      <button
                        key={item}
                        className="rounded-lg border border-white/10 bg-white/3 px-3 py-3 text-xs text-white/80 transition-all duration-300 hover:bg-white/6 active:bg-white/10"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </>
            )}

            {/* SAVED PROPERTIES */}
            {activeMenu === "saved" && (
              <SidebarCard className="p-4">
                <p className="text-xs text-white/50">
                  No saved properties yet. Explore the map and bookmark listings
                  you like.
                </p>
              </SidebarCard>
            )}

            {/* MESSAGES */}
            {activeMenu === "messages" && (
              <SidebarCard className="p-4">
                <p className="text-xs text-white/50">
                  You have no recent conversations
                </p>
              </SidebarCard>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Quick Access
            </p>
            <SidebarCard className="flex items-center gap-3 p-3">
              <Bell size={16} className="text-white/70 shrink-0" />
              <span className="text-xs text-white/70">Notifications</span>
            </SidebarCard>
            <SidebarCard className="flex items-center gap-3 p-3">
              <Activity size={16} className="text-white/70 shrink-0" />
              <span className="text-xs text-white/70">Recent Activity</span>
            </SidebarCard>
            <SidebarCard className="flex items-center gap-3 p-3">
              <TrendingUp size={16} className="text-white/70 shrink-0" />
              <span className="text-xs text-white/70">Trending Locations</span>
            </SidebarCard>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
