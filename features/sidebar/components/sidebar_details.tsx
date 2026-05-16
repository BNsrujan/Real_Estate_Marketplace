"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search, X, Lock,
  Bookmark, BookmarkCheck,
  Phone, MapPin, Home, Wheat, MapPinned,
  Building2, Landmark, Factory,
  Send, CheckCircle,
} from "lucide-react";
import { SidebarCard } from "@/shared/ui/sidebar_card";
import { useSidebarStore } from "../store/sidebar_store";
import { useStore } from "@/shared/store";
import PropertyCard from "@/features/properties/components/property_card";
import { useWatchlistSync } from "@/features/properties/hooks/use_watchlist_sync";
import { submitEnquiry } from "@/features/properties/api/enquiry_api";

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

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  house: Home,
  agriculture: Wheat,
  site: MapPinned,
  commercial_space: Building2,
  apartment: Landmark,
  commercial_plot: Factory,
  "agriculture land": Wheat,
  "commercial space": Building2,
  "commercial plots": Factory,
};

export function DetailPanel({ activeMenu: propActiveMenu, activeData }: DetailPanelProps) {
  const storeActiveMenu = useSidebarStore((s) => s.activeMenu);
  const savedProperties = useSidebarStore((s) => s.savedProperties);
  const selectedProperty = useSidebarStore((s) => s.selectedProperty);
  const setSelectedProperty = useSidebarStore((s) => s.setSelectedProperty);
  const activeMenu = propActiveMenu ?? storeActiveMenu;

  const saved = useStore((s) => s.watchlist.saved);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal = useStore((s) => s.openLoginModal);
  const { saveProperty, unsaveProperty } = useWatchlistSync();

  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  const isSaved = selectedProperty
    ? saved.some((p) => p.id === selectedProperty.id)
    : false;

  const handleClose = () => {
    setSelectedProperty(null);
    setShowEnquiry(false);
    setEnquiryMsg("");
    setEnquiryPhone("");
    setEnquirySent(false);
  };

  const handleSave = () => {
    if (!selectedProperty) return;
    if (!isAuthenticated) {
      openLoginModal({ type: "SAVE_PROPERTY", payload: { propertyId: selectedProperty.id } });
      return;
    }
    if (isSaved) unsaveProperty(selectedProperty.id);
    else saveProperty(selectedProperty);
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      openLoginModal({ type: "CONTACT_SELLER", payload: { propertyId: selectedProperty?.id ?? "" } });
      return;
    }
    setShowEnquiry(true);
  };

  const handleEnquirySubmit = async () => {
    if (!selectedProperty || enquiryMsg.trim().length < 10 || enquirySubmitting) return;
    setEnquirySubmitting(true);
    try {
      await submitEnquiry({
        propertyId: selectedProperty.id,
        message: enquiryMsg.trim(),
        phone: enquiryPhone.trim() || undefined,
      });
      setEnquirySent(true);
      setTimeout(() => {
        setEnquirySent(false);
        setShowEnquiry(false);
        setEnquiryMsg("");
        setEnquiryPhone("");
      }, 2500);
    } catch {
      // error toast handled by apiService
    } finally {
      setEnquirySubmitting(false);
    }
  };

  return (
    <aside
      className="relative w-105 overflow-hidden border-r h-screen border-white/10 backdrop-blur-3xl z-100 flex flex-col"
      style={{ backgroundColor: "rgba(20,20,20,0.7)" }}
    >
      {/* Background glow */}
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-[rgba(255,255,255,0.02)] opacity-5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {selectedProperty ? (
          <>
            {/* ── Hero image ── */}
            <div className="relative h-52 w-full shrink-0">
              <Image
                src={selectedProperty.thumbnailUrl || selectedProperty.imageUrls?.[0] || "/property/image.png"}
                alt={selectedProperty.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/20 to-black/70" />

              <button
                onClick={handleClose}
                className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X size={16} />
              </button>

              <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white capitalize">
                For {selectedProperty.listingType}
              </span>

              <button
                onClick={handleSave}
                className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 transition"
              >
                {isSaved
                  ? <BookmarkCheck size={16} className="text-emerald-400" />
                  : <Bookmark size={16} className="text-white" />}
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Title & location */}
              <div>
                {(() => {
                  const Icon = TYPE_ICON[selectedProperty.type] ?? Home;
                  return (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                        <Icon size={12} className="text-white/70" />
                        <span className="text-[11px] text-white/70 capitalize">
                          {selectedProperty.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                <h2 className="text-xl font-bold text-white leading-tight">{selectedProperty.title}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                  <MapPin size={13} />
                  {[selectedProperty.city, selectedProperty.taluk, selectedProperty.district]
                    .filter(Boolean)
                    .join(", ") || "Karnataka"}
                </p>
              </div>

              {/* Price & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Price</p>
                  <p className="text-lg font-bold text-white">{selectedProperty.priceLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Area</p>
                  <p className="text-lg font-bold text-white">
                    {selectedProperty.area}{" "}
                    <span className="text-sm font-normal text-white/60">{selectedProperty.areaUnit}</span>
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">About</p>
                  <p className="text-sm text-white/70 leading-relaxed line-clamp-4">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.map((f, i) => (
                      <span key={i} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                        {f.key}: {f.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Enquiry form ── */}
            {showEnquiry && (
              <div className="shrink-0 px-4 pb-3 space-y-2">
                {enquirySent ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-emerald-400">
                    <CheckCircle size={28} />
                    <p className="text-sm font-semibold">Enquiry sent!</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={enquiryMsg}
                      onChange={(e) => setEnquiryMsg(e.target.value)}
                      placeholder="Hi, I'm interested in this property..."
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                    <input
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="Phone number (optional)"
                      type="tel"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowEnquiry(false)}
                        className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm text-white/60 hover:bg-white/5 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEnquirySubmit}
                        disabled={enquiryMsg.trim().length < 10 || enquirySubmitting}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                      >
                        <Send size={14} />
                        {enquirySubmitting ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── CTA buttons ── */}
            <div className="shrink-0 p-4 pt-0 space-y-2">
              {!showEnquiry && (
                <button
                  onClick={handleContact}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white hover:bg-emerald-600 transition"
                >
                  <Phone size={16} />
                  {isAuthenticated ? "Contact Seller" : "Login to Contact"}
                </button>
              )}
              <button
                onClick={handleSave}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl border py-3.5 font-semibold transition ${
                  isSaved
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? "Saved" : "Save Property"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-7">
            <div className="mb-8">
              <div
                className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 backdrop-blur-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              >
                {activeData && <activeData.Icon size={34} className="text-white" />}
              </div>

              <h1 className="mb-3 text-3xl font-bold text-white">{activeData?.title}</h1>
              <p className="leading-relaxed text-white/55">{activeData?.description}</p>
            </div>

            <div className="space-y-4">
              {activeMenu === "map" &&
                ["Live Property Layers", "Nearby Infrastructure", "Satellite Intelligence"].map((item) => (
                  <SidebarCard key={item} className="p-5">
                    <h3 className="mb-2 font-semibold text-white">{item}</h3>
                    <p className="text-sm leading-relaxed text-white/50">
                      Advanced real estate visualization powered by Karnataka geo-spatial intelligence.
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
                    {["Under ₹50L", "Villa", "Apartment", "Commercial"].map((item) => (
                      <button
                        key={item}
                        className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm text-white/80 transition-all duration-300 hover:bg-[rgba(255,255,255,0.06)]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeMenu === "saved" && (
                <div className="space-y-3">
                  {!isAuthenticated ? (
                    <SidebarCard className="p-5 flex flex-col items-center gap-3 text-center">
                      <Lock size={28} className="text-white/30" />
                      <p className="text-sm text-white/50">Login to view your saved properties.</p>
                      <button
                        onClick={() => openLoginModal()}
                        className="mt-1 w-full rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30 transition"
                      >
                        Login
                      </button>
                    </SidebarCard>
                  ) : savedProperties.length === 0 ? (
                    <SidebarCard className="p-5">
                      <p className="text-sm text-white/50">
                        No saved properties yet. Start exploring the map to bookmark listings.
                      </p>
                    </SidebarCard>
                  ) : (
                    savedProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onOpen={(p) => setSelectedProperty(p)}
                      />
                    ))
                  )}
                </div>
              )}

              {activeMenu === "messages" && (
                <SidebarCard className="p-5">
                  {!isAuthenticated ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Lock size={28} className="text-white/30" />
                      <p className="text-sm text-white/50">Login to see your messages.</p>
                      <button
                        onClick={() => openLoginModal()}
                        className="w-full rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/30 transition"
                      >
                        Login
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">
                      No messages yet. Connect with agents to start a conversation.
                    </p>
                  )}
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
          </div>
        )}
      </div>
    </aside>
  );
}

export default DetailPanel;
