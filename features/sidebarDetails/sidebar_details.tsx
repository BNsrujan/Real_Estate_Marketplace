"use client";

import React from "react";
import { Search, X, MapPin, Grid2x2, DollarSign, Home } from "lucide-react";
import { SidebarCard } from "@/shared/ui/sidebar_card";
import { useSidebarStore } from "@/store/sidebar_store";
import { PropertyCard } from "@/features/properties/components/property_card";
import { DUMMY_PROPERTIES } from "@/features/properties/data/dummy_properties";

type MenuId = "map" | "search" | "saved" | "messages" | "profile";

type SidebarMenu = {
  id: MenuId;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

export type DetailPanelProps = {
  activeMenu?: MenuId;
  activeData?: SidebarMenu | null;
};

export function DetailPanel({ activeMenu: propActiveMenu, activeData }: DetailPanelProps) {
  const storeActiveMenu = useSidebarStore((s) => s.activeMenu);
  const savedProperties = useSidebarStore((s) => s.savedProperties);
  const selectedPropertyId = useSidebarStore((s) => s.selectedPropertyId);
  const setSelectedPropertyId = useSidebarStore((s) => s.setSelectedPropertyId);
  const activeMenu = propActiveMenu ?? storeActiveMenu;

  // Find the selected property from DUMMY_PROPERTIES (all properties) or saved properties
  const selectedProperty = selectedPropertyId
    ? DUMMY_PROPERTIES.find((p) => p.id === selectedPropertyId) || 
      savedProperties.find((p) => p.id === selectedPropertyId)
    : null;
  return (
    <aside
      className="relative w-105 overflow-hidden border-r h-screen border-white/10 p-7 backdrop-blur-3xl z-100"
      style={{ backgroundColor: "rgba(20,20,20,0.7)" }}
    >
      {/* Background glow */}
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-[rgba(255,255,255,0.02)] opacity-5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
       
        {selectedProperty ? (
          <>
            {/* Close button */}
            <button
              onClick={() => setSelectedPropertyId(null)}
              className="mb-6 p-2 hover:bg-white/10 rounded-lg transition-all"
              title="Close property details"
            >
              <X size={24} className="text-white" />
            </button>

            {/* Property details hero */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                  <Home size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{selectedProperty.title}</h1>
                  <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                    <MapPin size={14} />
                    {selectedProperty.district}, Karnataka
                  </p>
                </div>
              </div>
            </div>

            {/* Property info grid */}
            <div className="space-y-3">
              <SidebarCard className="p-4 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-white/60 font-semibold">Property Type</span>
                  <span className="text-sm font-semibold text-emerald-400 capitalize">
                    {selectedProperty.type}
                  </span>
                </div>
              </SidebarCard>

              <SidebarCard className="p-4 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-yellow-400" />
                    <span className="text-xs uppercase tracking-wider text-white/60 font-semibold">Price</span>
                  </div>
                  <span className="text-lg font-bold text-white">{selectedProperty.price}</span>
                </div>
              </SidebarCard>

              <SidebarCard className="p-4 border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Grid2x2 size={16} className="text-blue-400" />
                    <span className="text-xs uppercase tracking-wider text-white/60 font-semibold">Size</span>
                  </div>
                  <span className="text-lg font-semibold text-white">{selectedProperty.size}</span>
                </div>
              </SidebarCard>

              <button
                onClick={() => setSelectedPropertyId(null)}
                className="w-full mt-6 px-4 py-3 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/80"
              >
                View on Map
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Hero */}
            <div className="mb-8">
              <div
                className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 backdrop-blur-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              >
                {activeData && <activeData.Icon size={34} className="text-white" />}
              </div>

              <h1 className="mb-3 text-3xl font-bold">{activeData?.title}</h1>
              <p className="leading-relaxed text-white/55">
                {activeData?.description}
              </p>
            </div>

            {/* Dynamic content */}
            <div className="space-y-4">
              {activeMenu === "map" &&
                [
                  "Live Property Layers",
                  "Nearby Infrastructure",
                  "Satellite Intelligence",
                ].map((item) => (
                  <SidebarCard key={item} className="p-5">
                    <h3 className="mb-2 font-semibold text-white">{item}</h3>
                    <p className="text-sm leading-relaxed text-white/50">
                      Advanced real estate visualization powered by Karnataka
                      geo-spatial intelligence.
                    </p>
                  </SidebarCard>
                ))}

              {activeMenu === "search" && (
                <>
                  <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-4">
                    <Search size={18} className="text-white/40" />
                    <input
                      placeholder="Search Bengaluru..."
                      className="w-full bg-transparent outline-none placeholder:text-white/30 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {["Under ₹50L", "Villa", "Apartment", "Commercial"].map(
                      (item) => (
                        <button
                          key={item}
                          className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm text-white/80 transition-all duration-300 hover:bg-[rgba(255,255,255,0.06)]"
                        >
                          {item}
                        </button>
                      ),
                    )}
                  </div>
                </>
              )}

              {activeMenu === "saved" && (
                <div className="space-y-3">
                  {savedProperties.length === 0 ? (
                    <SidebarCard className="p-5">
                      <p className="text-sm text-white/50">
                        No saved properties yet. Start exploring the map to
                        bookmark listings.
                      </p>
                    </SidebarCard>
                  ) : (
                    savedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property as any} />
                    ))
                  )}
                </div>
              )}

              {activeMenu === "messages" && (
                <SidebarCard className="p-5">
                  <p className="text-sm text-white/50">
                    No messages yet. Connect with agents to start a conversation.
                  </p>
                </SidebarCard>
              )}

              {activeMenu === "profile" && (
                <>
                  <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
                    <div className="h-16 w-16 rounded-2xl bg-transparent border border-white/6" />
                    <div>
                      <h3 className="font-semibold text-white">Srujan BN</h3>
                      <p className="text-sm text-white/45">Premium Member</p>
                    </div>
                  </div>

                  <button className="w-full rounded-3xl border border-white/10 bg-transparent py-4 font-semibold text-white transition-all duration-300 hover:bg-[rgba(255,255,255,0.06)]">
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export default DetailPanel;
