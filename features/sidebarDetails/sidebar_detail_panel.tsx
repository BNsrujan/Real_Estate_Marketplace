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
} from "lucide-react";

import { useSidebarStore } from "@/store/sidebar_store";
import { SidebarCard } from "@/shared/ui/sidebar_card";

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
    Icon: MessageSquare,
  },
  profile: {
    id: "profile",
    title: "Profile",
    description: "Manage your account and preferences.",
    Icon: User,
  },
};

/**
 * SidebarDetailPanel — Slides in from the left when menu is active.
 * Shows menu-specific content (map features, search filters, profile, etc.).
 */
export default function SidebarDetailPanel() {
  const { activeMenu, isPanelOpen } = useSidebarStore();

  const menuData = useMemo(() => MENU_CONTENT[activeMenu], [activeMenu]);

  return (
    <aside
      className={`fixed left-16 md:left-22.5 top-0 h-screen w-80 md:w-96 lg:w-105 border-r border-white/10 bg-black/70 backdrop-blur-3xl overflow-y-auto transition-transform duration-300 z-40 ${
        isPanelOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ backgroundColor: "rgba(20,20,20,0.7)" }}
    >
      {/* Background glow */}
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-white/2 opacity-5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-4 md:p-5 lg:p-7">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/2 backdrop-blur-xl">
            {menuData && <menuData.Icon size={34} className="text-white" />}
          </div>

          <h1 className="mb-3 text-3xl font-bold text-white">{menuData?.title}</h1>
          <p className="leading-relaxed text-white/55">
            {menuData?.description}
          </p>
        </div>

        {/* Dynamic Content by Menu */}
        <div className="space-y-4">
          {/* MAP EXPLORER */}
          {activeMenu === "map" && (
            <>
              {[
                "Live Property Layers",
                "Nearby Infrastructure",
                "Satellite Intelligence",
              ].map((title) => (
                <SidebarCard key={title} className="p-5">
                  <h3 className="mb-2 font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">
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
              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/3 px-5 py-4">
                <Search size={18} className="text-white/40" />
                <input
                  placeholder="Search Bengaluru..."
                  className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Under ₹50L", "Villa", "Apartment", "Commercial"].map(
                  (item) => (
                    <button
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/3 px-4 py-4 text-sm text-white/80 transition-all duration-300 hover:bg-white/6"
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </>
          )}

          {/* SAVED PROPERTIES */}
          {activeMenu === "saved" && (
            <SidebarCard className="p-5">
              <p className="text-sm text-white/50">
                No saved properties yet. Explore the map and bookmark listings
                you like.
              </p>
            </SidebarCard>
          )}

          {/* MESSAGES */}
          {activeMenu === "messages" && (
            <SidebarCard className="p-5">
              <p className="text-sm text-white/50">
                No messages yet. Connect with agents to start conversations.
              </p>
            </SidebarCard>
          )}

          {/* PROFILE */}
          {activeMenu === "profile" && (
            <>
              <SidebarCard className="flex items-center gap-4 p-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/3" />
                <div>
                  <h3 className="font-semibold text-white">Srujan BN</h3>
                  <p className="text-sm text-white/45">Premium Member</p>
                </div>
              </SidebarCard>

              <button className="w-full rounded-3xl border border-white/10 bg-white/3 py-4 font-semibold text-white transition-all duration-300 hover:bg-white/6">
                Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Quick Actions Section (always visible) */}
        <div className="mt-10 space-y-4 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-widest text-white/40">
            Quick Access
          </p>
          <SidebarCard className="flex items-center gap-3 p-3">
            <Bell size={18} className="text-white/70" />
            <span className="text-sm text-white/70">Notifications</span>
          </SidebarCard>
          <SidebarCard className="flex items-center gap-3 p-3">
            <Activity size={18} className="text-white/70" />
            <span className="text-sm text-white/70">Recent Activity</span>
          </SidebarCard>
          <SidebarCard className="flex items-center gap-3 p-3">
            <TrendingUp size={18} className="text-white/70" />
            <span className="text-sm text-white/70">Trending Locations</span>
          </SidebarCard>
        </div>
      </div>
    </aside>
  );
}
